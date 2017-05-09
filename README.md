# LinkedList

Job Search Management Tool

Job seekers can use this dashboard to plan and manage the entire job application process.

# Live Demo

http://hrnyc7-europa.herokuapp.com

## Team

  - __Product Owner__: Thomas O'Connor
  - __Scrum Master__: Willian Hua
  - __Development Team Members__: Arturo Ruvalcaba, Joel Camacho

## Table of Contents

1. [Usage](#Usage)
1. [Requirements](#requirements)
1. [Development](#development)
    1. [Installing Dependencies](#installing-dependencies)
1. [Team](#team)
1. [Contributing](#contributing)

## Usage
1. Install dependencies (instructions below)
2. npm start

## Requirements

- Node.js latest
- npm latest
- bower latest
- mongodb latest

## Development

### Installing Dependencies

From within the root directory:

```sh
sudo npm install -g bower
npm install
bower install
sudo npm install -g grunt
grunt build
sudo service mongod start
```
### Putting in API Keys and Mongodb

Get Bing News API Key and put into /server/config/config.js
- https://www.microsoft.com/cognitive-services/en-us/bing-news-search-api

Get Full Contact API Key and put into /server/config/config.js
- https://www.fullcontact.com/developer/docs/company/ 

Start mongod service or host mongod on MLabs
Put URI into /server/db/db-config.js

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## Style Guide

See [STYLE-GUIDE.md](STYLE-GUIDE.md) for style guidelines.