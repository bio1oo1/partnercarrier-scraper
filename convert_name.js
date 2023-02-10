const fs = require('fs');

(async () => {
  try {
    const files = fs.readdirSync('./result');
    let count = 0;
    for (file of files) {
      if (file.includes('output')) {
        count++;
        console.log(file);
        const newName = file.split('_')[1];
        fs.renameSync(`./result/${file}`, `./result/${newName}`);
      }
    }
    console.log(`Count: ${count}`);
  } catch (e) {
    console.log(e);
    // console.log('Already Logged in goes to main portal page.');
  }
})();
