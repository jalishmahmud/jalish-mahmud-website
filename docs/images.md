# Section images

Store site photos in `public/images/<section>/`. Each homepage section already has a folder. The Work History section uses `experience`.

Use `config/images.js` as the single place to map an image key to its source. For example, after adding `public/images/experience/jb-team.webp`, replace the `jbTeamCollaboration` value with:

```js
jbTeamCollaboration: imagePath("experience", "jb-team.webp"),
```

The Work History and gallery data files use image keys and alt text. Their components resolve the keys through `getSectionImage()`, so a photo only needs one path change in the config. Keep the alt text in the data file descriptive. Current remote photos remain mapped until local files are provided.

For a new section image, add a named entry to its section in `siteImages`, then import `getSectionImage` in the component:

```js
import { getSectionImage } from "@/config/images";

const src = getSectionImage("projects", "myProject");
```

Render it with `next/image` or the existing `ContentImage` component. `ContentImage` optimizes paths under `/images/` and lazy loads them by default. Supply an accurate `sizes` value for responsive layouts; use eager loading only for an image visible immediately on page load. For a new image that is not inside a fixed-ratio container, provide its actual width and height so the page reserves the correct space before it loads. Prefer WebP or AVIF, and use a new filename when replacing an existing image so cached versions refresh reliably.

Gallery photo dimensions live beside each photo's `imageKey` in `data/gallery.json`. Update `width` and `height` if a replacement file has a different aspect ratio.

For an image that is known at build time, you can also statically import the file into `config/images.js` and map its key to that import. Next.js will then read its real dimensions automatically.
