const data = require("./json/data.json");
fs = require("fs");

// clears any previous text from all .txt files
function clearFile(file) {
  fs.writeFile(file, "", function (err) {
    if (err) return console.log(err);
    console.log(`Cleared ${file}`)
  })
}

function writeToFile(file, content) {
  fs.writeFile(file, content, function (err) {
    if (err) return console.log(err);
    console.log(`Writing to ${file}`);
  });
}

// https://stackoverflow.com/questions/19700283/how-to-convert-time-in-milliseconds-to-hours-min-sec-format-in-javascript
function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return hours + ":" + minutes + ":" + seconds;
}

function sentimentAnalysis() {
  const sentiments = data.sentiment_analysis_results;
  const total = sentiments.length
  let positive = 0;
  let negative = 0;
  let neutral = 0;

  for (const sentiment of sentiments) {
    if (sentiment.sentiment == "POSITIVE") {
      positive += 1;
    }
    if (sentiment.sentiment == "NEGATIVE") {
      negative += 1;
    }
    if (sentiment.sentiment == "NEUTRAL") {
      neutral += 1;
    }
  }

  let posPercentage =((positive / total) * 100).toFixed(2) + "%";
  let negPercentage = ((negative / total) * 100).toFixed(2) + "%";
  let neutPercentage = ((neutral / total) * 100).toFixed(2) + "%";
  
  return `Total Positive Sentiments: ${positive} (${posPercentage})\nTotal Negative Sentiments: ${negative} (${negPercentage})\nTotal Neutral Sentiments: ${neutral} (${neutPercentage})`
}

function autoChapters() {
  const chapters = data.chapters;
  let time;
  let text = "";
  for (const chapter of chapters) {
    time = chapter.start;
    time = msToTime(time)
    text += time + " " + chapter.headline + "\n";
  }
  return text;
}

function entityDetection() {
  const entities = data.entities;
  const entitiesDetected = [];
  let text = "";

  for (const entity of entities) {
    entitiesDetected.push(entity.entity_type);
  }

  // https://medium.com/@estherspark91/how-to-get-the-word-count-in-an-array-using-javascript-8206f14f2f43
  const count = entitiesDetected.reduce((prev, nxt) => {
      prev[nxt] = (prev[nxt] + 1) || 1;
      return prev;
    }, {});

  for (const item in count) {
    text += `${item} ( count: ${count[item]} )\n`
  }
  return text;
}

function keywordDetection() {
  const keywords = data.auto_highlights_result.results;
  let text = "";

  for (const keyword in keywords) {
    text += `${keywords[keyword].text} ( count: ${keywords[keyword].timestamps.length} )\n`;
  }

  return text;
}

function topicDetection() {
  const topics = data.iab_categories_result.summary;
  let text = ""

  for (const topic in topics) {
    if (topic.includes(">")) {
      label = topic.split(">")
      label = label[label.length - 1]
      text += `${label}: ${Math.round(topics[topic] * 100, 2)}%\n`
    } else {
      label = topic
      text += `${label}: ${Math.round(topics[topic] * 100, 2)}%\n`
    }
  }
  
  return text;
}

function contentSafetyDetection() {
  contents = data.content_safety_labels.summary;
  let text = ""

  for (const topic in contents) {
    text += `${topic}: ${Math.round(contents[topic] * 100, 2)}%\n`
  }

  if (text.length === 0) {
    text = "No content labels were triggered.";
  }

  return text;
}

// clear all text files
clearFile("sentiment.txt");
clearFile("chapters.txt");
clearFile("entities.txt");
clearFile("keywords.txt");
clearFile("topics.txt");
clearFile("content_labels.txt");

// write to all text files
writeToFile("sentiment.txt", sentimentAnalysis());
writeToFile("chapters.txt", autoChapters());
writeToFile("entities.txt", entityDetection());
writeToFile("keywords.txt", keywordDetection());
writeToFile("topics.txt", topicDetection());
writeToFile("content_labels.txt", contentSafetyDetection());
