* There is a bug where passing the PostLayout for a Post doesn't seem to render
emojis special chars etc. This is NOT a utf-8 issue. Most likely something regarding the rendering.
https://github.com/withastro/astro/issues/8057
Need to investigate ASAP. Reason being if we fix this we get access to the props added to the markdown files, from Astro:
https://docs.astro.build/en/basics/layouts/#markdown-layout-props
So we can add a table of contents to the post.
* Create predifined global or "local" classes for posts, for stuff like:
  1) Lists
  2) Tag decoration color
* DONE Make the sections of a post navigateable with query params.
* Table of contents
* Small quizes on code snippets
