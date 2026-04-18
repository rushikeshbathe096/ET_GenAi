const fs = require('fs');
let content = fs.readFileSync('dashboard/utils/api.ts', 'utf8');

// Fix confidence logic to handle strings or numbers
content = content.replace(
  /const rawConf = Number\(stock\.confidence \|\| 0\);\s*const confidence = rawConf >= 70 \? "HIGH" :\s*rawConf >= 45 \? "MEDIUM" : "LOW";/m,
  `let confidence = "LOW";
  if (typeof stock.confidence === "string") {
    const uc = stock.confidence.toUpperCase();
    if (["HIGH", "MEDIUM", "LOW"].includes(uc)) confidence = uc;
  } else {
    const rawConf = Number(stock.confidence || 0);
    confidence = rawConf >= 70 ? "HIGH" : rawConf >= 45 ? "MEDIUM" : "LOW";
  }`
);

// Fix news logic to handle arrays directly
content = content.replace(
  /const newsHeadlines = stock\.news_headlines \|\| stock\.news\?\.headlines \|\| \[\];/m,
  `const newsHeadlines = Array.isArray(stock.news) ? stock.news : (stock.news_headlines || stock.news?.headlines || []);`
);

// Fix fallback logic to be robust
content = content.replace(
  /rawStocks = response\?\.opportunities \|\| \[\];/g,
  `rawStocks = response?.opportunities || response?.data?.stocks || response?.stocks || [];`
);

fs.writeFileSync('dashboard/utils/api.ts', content);
