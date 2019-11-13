const Joi = require('joi');
const rp = require('request-promise');
const cheerio = require('cheerio')
const express = require('express');
const app = express();
const fs = require('fs');


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
 
app.get('/', function (req, res) {
  res.send('Crawler Home')
}).post('/api/scrape', (req, res)=>{

  var jsonFileContent = [];
  var linksArray = [];

  const schema = {
    url: Joi.string().uri().min(4).max(255).required(),
    depth: Joi.number().integer().allow(null).allow('').default(3),
    regex: Joi.string().max(255).allow(null).allow('').optional()
  };

  const urlSchema = {
    url: Joi.string().uri().min(4).max(255)
  }

  const result = Joi.validate(req.body, schema);
  
  if(result.error){
    res.status(400).send(result.error.details[0].message);
    return;
  }

  url = req.body.url;
  regex = req.body.regex;
  if(req.body.depth != 0) {depth = req.body.depth}else{depth = 3};

  const options = {
    url: url,
    json: true,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36'
    }
  }

 rp (options)
  .then((htmlCode)=>{

    jsonFileContent.push(`{${url}:[]}`);  

    var links = getHtmlLinks(htmlCode, regex);
    var i=0;

    links.forEach((link) =>{
      options.url = link;   

      const result = Joi.validate({"url":link}, urlSchema);  
      if(result.error){

      }else{
        for(i; i<depth; i++){
        
          rp (options)
            .then((data)=>{
              var newLinks =  getHtmlLinks(data, regex);
              linksArray.push(newLinks);
              linksObj = {
                "root":url,
                "sublinks":[{"link:":link, "children": linksArray}]
              }

              var jsonObj = JSON.stringify(linksObj);
              console.log(jsonObj);
              fs.writeFile('scraped/nd.json', jsonObj, 'utf8', (err)=>{console.log(err)});
          }).catch((err)=>console.log(err))     
          }
      }     
    });    
    
    res.send(links);
  })
  .catch((err) => { console.log(err)});
  
});

/*
function fetchHtml(url){
  const options = {
    url: url,
    json: true
  }
return  rp (options)
  .then((data)=>{
    return data;
  })
  .catch((err) => { console.log(err)});
}
*/

function mapChildrenToParentLinks(){

}

function getHtmlLinks(htmlCode, regex = ''){ 
var link_array = []; 
var links = [];

const $ = cheerio.load(htmlCode.toString());

$('a').each((i, link)=>{
 link_array[i] = $(link).attr('href');
  });

 
  if(regex !== ''){
    console.log('regexValue: '+regex);
    
    let matches = link_array.filter(link => {
      const r = new RegExp(`${regex}`);
      if(link.match(r)){
        links.push(link);
      }      
    });
    
  }  

  return uniqueArray(links); 
  
}

function uniqueArray(array){
 var uniqueArray = array.filter(function(elem, pos) {
      return array.indexOf(elem) == pos;
    });
  return uniqueArray;
}

const port = process.env.PORT || 3000;
app.listen(port, ()=>console.log(`Listening on port ${port}`));