# Historical Timeline Explorer

A multi-topic historical timeline that allows users to explore how events across different areas (wars, science, art, etc.) unfolded simultaneously throughout history.

## Features

- **Multi-Topic Comparison**: Add up to 5 historical topics and see their events aligned on a unified timeline
- **Synchronized Scrolling**: All timeline tracks scroll together to maintain temporal alignment
- **Mobile Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- **Interactive Search**: Search for historical topics and dynamically load event data
- **Color-Coded Topics**: Each topic gets its own color for easy visual distinction
- **Wikipedia Integration**: Automatically fetches historical events from Wikipedia

## Live Demo

🚀 **[View Live Site](https://your-site.vercel.app)** (will be your URL after deployment)

## Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/shawnrmelton/historical-timeline.git
   cd historical-timeline
   ```

2. **Open in browser**
   Simply open `index.html` in your browser for local development

3. **For API testing**
   You'll need to deploy to Vercel to test the Wikipedia API integration

## Deployment to Vercel

1. **Connect GitHub to Vercel** (you're doing this now!)
2. **Import your repository** from your GitHub account
3. **Deploy** - Vercel will automatically detect this as a static site with serverless functions

## Project Structure

```
historical-timeline/
├── index.html          # Main HTML file
├── styles.css          # All styles and responsive design
├── script.js           # Frontend JavaScript logic
├── api/
│   └── wikipedia.js    # Serverless function for Wikipedia API
└── README.md           # This file
```

## How to Use

1. **Search for a topic** like "World Wars", "Space Exploration", or "Renaissance Art"
2. **Add up to 5 topics** to compare their timelines
3. **Scroll horizontally** to explore different time periods
4. **Hover over events** for more details
5. **Use keyboard arrows** or control buttons for navigation

## Sample Topics to Try

- World Wars
- Space Exploration  
- Industrial Revolution
- Scientific Revolution
- Renaissance Art
- Ancient Civilizations
- American History
- European History
- Technological Innovation

## Technical Details

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Backend**: Vercel Serverless Functions
- **APIs**: Wikipedia API for dynamic content
- **Hosting**: Vercel (static site + serverless functions)

## Future Enhancements

- [ ] More sophisticated Wikipedia content parsing
- [ ] User accounts and saved timelines
- [ ] Export timeline as image/PDF
- [ ] Additional data sources beyond Wikipedia
- [ ] Advanced filtering and search options
- [ ] Social sharing of timeline combinations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for your own historical explorations!

## Contact

Created by Shawn Melton - feel free to reach out with suggestions or improvements!