# cloud-np.com
A personal site to hold my blog post and some other minor demos. Used various ideas from other templates/astro code bases

I'm mostly trying out new stuff or experiment with techonologies here, this is for example
why you would also find two different folders containing `qwik` and `react` which both
are jsx based frameworks but ofcourse their compiler differ which means TS has a hardtime knowing what is it.

NOTE:
I'd try to clean it up a bit once I get sometime 🥲

### Project Structure
Small overview of the project structure (not everything included):
```
src/
├── assets/
├── components/
│   ├── common/             # Shared/reusable components across the app
│   ├── core/               # Core functionality components
│   ├── layout/             # Components specifically for layouts
│   ├── interactive/        # Interactive UI components
│   ├── content/            # Content-focused components
│   ├── containers/         # Existing containers folder
│   ├── mdx/                # MDX-specific components  
│   ├── post/               # Post-specific components
│   ├── qwik/               # Qwik-specific components
│   └── react/              # React-specific components
├── content/
├── data/
├── layouts/                # Just layout definitions, no components
├── libs/
├── pages/
└── utils/
```