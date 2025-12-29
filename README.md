# Výkaz práce – Editace statusů

Interactive mockup demo for work status editing system (Pracovní statusy).

![Preview](https://img.shields.io/badge/Status-Demo-blue)
![React](https://img.shields.io/badge/React-18.2-61dafb)
![Vite](https://img.shields.io/badge/Vite-5.0-646cff)

## 🚀 Features

- **Visual Timeline**: Horizontal blocks representing work statuses with proportional widths
- **Status Types**: Work statuses (green indicator) and non-work statuses (orange indicator)
- **CRUD Operations**: Create, edit, delete, and split statuses
- **Tooltips**: Hover over blocks for detailed information
- **Statistics**: Real-time calculation of total time, work time, etc.
- **Responsive Design**: Works on desktop and mobile

## 📦 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/work-status-editor.git

# Navigate to project directory
cd work-status-editor

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## 🌐 Deploy to GitHub Pages

### Option 1: Automatic Deployment (Recommended)

1. **Create a GitHub repository** named `work-status-editor`

2. **Push your code**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/work-status-editor.git
   git push -u origin main
   ```

3. **Deploy**:
   ```bash
   npm run build
   npm run deploy
   ```

4. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under "Source", select **Deploy from a branch**
   - Select branch: `gh-pages` / `/ (root)`
   - Click **Save**

5. Your site will be live at: `https://YOUR_USERNAME.github.io/work-status-editor/`

### Option 2: GitHub Actions (CI/CD)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

Then in GitHub Settings → Pages → Source, select **GitHub Actions**.

## ⚙️ Configuration

### Change Repository Name

If your repository has a different name, update `vite.config.js`:

```js
export default defineConfig({
  plugins: [react()],
  base: '/YOUR-REPO-NAME/', // Change this
})
```

### Custom Domain

1. Add a `CNAME` file in the `public/` folder with your domain
2. Update `vite.config.js`:
   ```js
   base: '/', // Use root for custom domain
   ```

## 🛠️ Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
work-status-editor/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx          # Main component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🎨 Status Types

### Work Statuses (Pracovní)
- 👷 Práce (Příchod)
- 🚶 Přechod (Mezi pracovišti)
- 🚗 Pracovní cesta
- ⚙️ Příprava na práci
- 🌾 Kultivování pole
- 🔧 Údržba techniky
- 🚜 Jízda v areálu
- ➡️ Přejezd
- 🌱 Příprava půdy

### Non-Work Statuses (Nepracovní)
- 🏖️ Dovolená
- 🏥 Lékař
- 🤒 Nemoc
- 👶 OČR
- ☕ Přestávka

## 📝 License

MIT License - feel free to use this for your projects.

---

Made with ❤️ for agricultural workforce management
