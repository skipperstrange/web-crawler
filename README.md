# web-crawler
basic web crawler

Run npm install to install dependancies.
change directory to root of project and run node "index.js" to start app.
The API works with any API client e.g. Postman.

default port if not set in env is 3000.

api routes
---------------------------------------------------

/ - [GET]
/api/scrape - [POST] Parameters: {url: a valid url, regex: regular expression to be matched, depth: level of deep links to explore}

Results are written to file located ./scraped/nd.json and links mathed at 1st level are returned to API client.
