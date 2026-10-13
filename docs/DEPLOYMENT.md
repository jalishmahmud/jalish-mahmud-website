# GitHub Actions and AWS EC2 deployment

This project deploys the `production` branch to an existing EC2 instance.

- Pull requests targeting `production` run `npm ci` and `npm run build`.
- A merge into `production` runs the same checks, uploads the files to EC2, builds there, and reloads the PM2 process.
- `.env*`, `.git`, `.github`, `.next`, and `node_modules` are never uploaded.

## 1. Prepare EC2 once

Run these commands on the EC2 instance as the user that will run the application:

```bash
node --version
npm --version
sudo npm install --global pm2
mkdir -p /var/www/jalish-mahmud-website
```

Use a supported Node.js LTS version. The workflow uses Node.js 22, so Node 22 is recommended on EC2 too.

If the app needs environment variables, create them on EC2. Do not commit them:

```bash
cd /var/www/jalish-mahmud-website
nano .env.production
```

The EC2 security group must allow inbound TCP traffic on the port used by your reverse proxy or by Next.js. If using `next start` directly, the default port is `3000`.

## 2. Create a deployment SSH key

On your local computer, create a key specifically for GitHub Actions:

```bash
ssh-keygen -t ed25519 -C "github-actions-production" -f ~/.ssh/github-actions-production
```

Do not add a passphrase, because the workflow cannot answer an interactive prompt.

Append the public key to the EC2 user's authorized keys:

```bash
cat ~/.ssh/github-actions-production.pub | ssh -i /path/to/current-ec2-key.pem EC2_USER@EC2_HOST \
  "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

Replace `EC2_USER`, `EC2_HOST`, and the path to your existing EC2 access key. Test the new key before continuing:

```bash
ssh -i ~/.ssh/github-actions-production EC2_USER@EC2_HOST
```

## 3. Add GitHub Actions secrets

In GitHub, open **Settings > Secrets and variables > Actions > Secrets > New repository secret** and add:

| Name | Value |
| --- | --- |
| `EC2_HOST` | Public DNS name or IP address of EC2, without `http://` or a port |
| `EC2_USER` | Linux user that owns the app, for example `ubuntu` or `ec2-user` |
| `EC2_SSH_KEY` | Entire contents of `~/.ssh/github-actions-production` (private key) |
| `EC2_KNOWN_HOSTS` | Output of `ssh-keyscan -H EC2_HOST` |

Generate the host value from a trusted network connection:

```bash
ssh-keyscan -H EC2_HOST
```

Verify the fingerprint before storing it. Never put the private key in a normal GitHub variable or commit it to the repository.

## 4. Add GitHub Actions variables

Open **Settings > Secrets and variables > Actions > Variables > New repository variable** and add:

| Name | Example value |
| --- | --- |
| `EC2_PORT` | `22` |
| `EC2_APP_DIR` | `/var/www/jalish-mahmud-website` |
| `PM2_APP_NAME` | `jalish-mahmud-website` |

The workflow uses port `22` if `EC2_PORT` is empty. `EC2_APP_DIR` must be writable by `EC2_USER`.

## 5. Enable the workflow

Commit this workflow and guide, then push them to your repository:

```bash
git add .github/workflows/ci-cd.yml DEPLOYMENT.md
git commit -m "Add EC2 CI/CD deployment"
git push origin v1
```

Open a pull request from `v1` into `production`. The validation job must pass. After merging, the push to `production` starts the deployment job automatically. You can monitor it under the repository's **Actions** tab.

## 6. Verify the first deployment

On EC2, check the process and logs:

```bash
pm2 status
pm2 logs jalish-mahmud-website --lines 100
```

If the EC2 instance reboots, configure PM2 startup once as the application user:

```bash
pm2 startup
# Run the sudo command printed by PM2
pm2 save
```

Ensure the reverse proxy, DNS, and HTTPS configuration already point to the application. The workflow only deploys and starts Next.js; it does not configure Nginx, a load balancer, DNS, or TLS.

## Rollback

The simplest rollback is to revert the bad commit and merge the revert into `production`:

```bash
git revert COMMIT_SHA
git push origin production
```

That push triggers the workflow and redeploys the reverted version.