const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');

const app = express();

app.set('view engine', 'ejs');

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, 'tmp'),
    createParentPath: true,
    limits: { fileSize: 2 * 1024 * 1024 },
  })
);

const AddTwoNumbers = (name1, name2) => {
  let stringListValues = matchTwoNames(name1, name2);
  const convertToNumber = Number(stringListValues);
  let valueList = Array.from(convertToNumber.toString()).map(Number);
  let listchange = [];
  //let valueList = [2,2,2,1,1,1,1,1,1,1,2,2,2,2];
  let sumValue = '';
  let value = valueList.length - 1;
  let count = 0;
  listchange = [];

  while (listchange.length != 2) {
    listchange = [];
    for (let i = 0; i < valueList.length; i++) {
      if (i != value) {
        sumValue += valueList[i] + valueList[value];
        listchange = Array.from(sumValue.toString()).map(Number);
      } else {
        if (valueList.length == 3) {
          sumValue += valueList[i];
        } else {
          sumValue += valueList[i + 1];
        }
        listchange = Array.from(sumValue.toString()).map(Number);
        break;
      }
      value--;
      if (i == value) {
        break;
      }
    }
    valueList = listchange;
    value = valueList.length - 1;
    sumValue = '';
  }

  console.log(sumValue);
  console.log(Number(listchange.join('')));

  return Number(listchange.join(''));
};

const matchTwoNames = (name1, name2) => {
  const string = `${name1} matches ${name2}`;
  const str = string.replace(/ +/g, '');
  const myArr = str.split('');
  let count = 1;
  let num = 1;
  let isChecked = false;
  let matchLetters = [];
  let matchNumbers = '';

  for (let i = 0; i < myArr.length; i++) {
    if (num > myArr.length - 1) {
      isChecked = true;
    }
    for (let j = num; j < myArr.length; j++) {
      if (myArr[i] == myArr[j]) {
        count++;
        matchLetters.push(myArr[i]);
        matchNumbers += `${count}`;
      } else {
        for (let x = 0; x < matchLetters.length; x++) {
          if (myArr[i] == matchLetters[x]) {
            isChecked = true;
          }
        }
      }
    }
    num++;
    if (count != 1) {
      count = 1;
      isChecked = false;
    } else if (isChecked) {
      isChecked = false;
      continue;
    } else {
      matchNumbers += `${count}`;
    }
  }

  return matchNumbers;
  // console.log(matchNumbers);
  // console.log(matchLetters);
};

const writeToTextFile = (goodMatchResult) => {
  const fs = require('fs');

  fs.writeFile('output.txt', goodMatchResult, (err) => {
    if (err) throw err;
    console.log('Good Match Result saved!');
  });
};

const convertCVSToArray = () => {
  let genderM = [];
  let genderF = [];
  let goodmatch = '';
  const parse = require('csv-parse');
  const fs = require('fs');

  const csvData = [];
  fs.createReadStream(__dirname + '/uploads/test2.csv')
    .pipe(
      parse({
        delimiter: ',',
      })
    )
    .on('data', function (dataRow) {
      csvData.push(dataRow);
    })
    .on('end', function () {
      for (let i = 0; i < 7; i++) {
        if (csvData[i][1].trim() === 'm') {
          genderM.push(csvData[i][0]);
        } else {
          genderF.push(csvData[i][0]);
        }
      }
      //good Match
      for (let m = 0; m < genderM.length; m++) {
        for (let f = 0; f < genderF.length; f++) {
          goodmatch += `${genderM[m]} matches ${genderF[f]} ${AddTwoNumbers(
            genderM[m],
            genderF[f]
          )},`;
        }
      }
      let array = [];
      let listResult = goodmatch.split(',', 12);
      for (let i = 0; i < listResult.length; i++) {
        array[i] = listResult[i].split(' ', 4);
        // console.log(array[i][3]);
      }

      let myArray = array.sort(function (a, b) {
        return b[3].localeCompare(a[3]);
      });
      console.log(myArray.join('\n'));
      writeToTextFile(myArray.join('\n'));
    });

  return myArray.join('\n');
};

app.get('/', async (req, res, next) => {
  res.render('index');
});

app.post('/single', async (req, res, next) => {
  try {
    const file = req.files.mFile;
    console.log(file);
    // const fileName = new Date().getTime().toString() + path.extname(file.name);
    const savePath = path.join(__dirname, 'uploads', file.name);
    if (file.truncated) {
      throw new Error('File size is too big...');
    }
    await file.mv(savePath);
    res.redirect('/');
  } catch (error) {
    console.log(error);
    res.send('Error uploading file');
  }
});

app.get('/csvToArray', async (req, res, next) => {
  convertCVSToArray();
 res.send('hello world');
  //res.redirect('/');
  // res.send('Error uploading file');
});

app.listen(3000, () => console.log('🚀 server on port 3000'));
