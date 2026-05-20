const express = require("express");
const router = express.Router();

const multer = require("multer");
const fs = require("fs");
const path = require("path");

const pdfParse = require("pdf-parse");
const PDFDocument = require("pdfkit");



/* =========================================
   CREATE FOLDERS
========================================= */

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

if (!fs.existsSync("generated")) {
  fs.mkdirSync("generated");
}



/* =========================================
   MULTER
========================================= */

const storage = multer.diskStorage({

  destination: function (req, file, cb) {

    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {

    cb(
      null,
      Date.now() + "-" + file.originalname
    );
  }

});

const upload = multer({
  storage: storage
});



/* =========================================
   SHUFFLE ARRAY
========================================= */

function shuffleArray(array) {

  return [...array].sort(
    () => Math.random() - 0.5
  );
}



/* =========================================
   PERSONAL QUESTIONS
========================================= */

function extractPersonalQuestions(text) {

  let questions = [];



  text = text

    .replace(/\r/g, "\n")

    .replace(/\t/g, " ")

    .replace(/[ ]{2,}/g, " ")



    // FIX:
    // 1.Name -> 1. Name

    .replace(/(\d+)\.([A-Za-z])/g, "$1. $2")



    // FIX:
    // 1. Name 2. MOB Number
    // ->
    // 1. Name
    // 2. MOB Number

    .replace(/(\d+\.\s.*?)(?=\d+\.\s)/g, "$1\n")



    .trim();




  const blocks = text.split(/\n/);




  blocks.forEach(block => {

    block = block.trim();




    if (block.length < 3) {
      return;
    }




    // REMOVE QUESTION NUMBER

    block = block.replace(
      /^\d+\.\s*/,
      ""
    );




    // SKIP SECTION HEADINGS

    if (
      block.toUpperCase().includes("SECTION")
    ) {
      return;
    }




    questions.push({

      question: block

    });

  });




  return questions;
}



/* =========================================
   FLEXIBLE MCQ PARSER
========================================= */

function extractQuestions(text) {

  let questions = [];



  text = text

    .replace(/\r/g, "\n")

    .replace(/\t/g, " ")

    .replace(/[ ]{2,}/g, " ")



    // 111.What -> 111. What

    .replace(/(\d+)\.([A-Za-z])/g, "$1. $2")



    // A.Option -> A. Option

    .replace(/([A-Da-d])\.([A-Za-z])/g, "$1. $2")



    // A)Option -> A) Option

    .replace(/([A-Da-d])\)([A-Za-z])/g, "$1) $2")



    // ADD NEWLINE BEFORE NEXT QUESTION

    .replace(
      /([A-Da-d][\.\)][\s\S]*?)(\d+\.)/g,
      (match, optionPart, nextQuestion) => {

        return optionPart + "\n" + nextQuestion;

      }
    )



    .replace(/\n{2,}/g, "\n")

    .trim();




  const blocks = text.split(

    /(?=\n?\d+\.\s)/g

  );




  blocks.forEach(block => {

    block = block.trim();




    if (block.length < 5) {
      return;
    }




    block = block.replace(
      /^\d+\.\s*/,
      ""
    );




    let lines = block

      .split("\n")

      .map(line => line.trim())

      .filter(line => line.length > 0);




    if (lines.length === 0) {
      return;
    }




    let question = "";
    let options = [];




    lines.forEach(line => {

      // OPTION DETECTION

      if (/^[A-Da-d][\.\)]/.test(line)) {

        options.push(line);

      }

      else {

        // QUESTION

        if (options.length === 0) {

          question += line + " ";

        }

        // CONTINUE OPTION

        else {

          options[options.length - 1] +=
            " " + line;

        }

      }

    });




    question = question

      .replace(/[ ]{2,}/g, " ")

      .trim();




    options = options.map(opt =>

      opt

        .replace(/[ ]{2,}/g, " ")

        .trim()

    );




    if (
      question.length > 5 &&
      options.length > 0
    ) {

      questions.push({

        question,

        options

      });

    }

  });




  return questions;
}



/* =========================================
   COMPREHENSION PARSER
========================================= */

function extractComprehensions(text) {

  let comprehensions = [];



  text = text
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ");




  const blocks = text.split(

    /(?=Q\d+\.)/g

  );




  blocks.forEach(block => {

    block = block.trim();




    if (block.length < 200) {
      return;
    }




    block = block.replace(
      /^Q\d+\./,
      ""
    ).trim();




    const questionStart =
      block.search(
        /\n\d+\.\s/
      );




    if (questionStart === -1) {
      return;
    }




    let passage =
      block.substring(
        0,
        questionStart
      ).trim();




    let questionPart =
      block.substring(
        questionStart
      ).trim();




    passage = passage

      .replace(
        /Read the following passage carefully and answer the questions below\.?/gi,
        ""
      )

      .replace(
        /Read the Below para and answer \d+ Questions/gi,
        ""
      )

      .replace(
        /Based on the Passage, answer the following questions:?/gi,
        ""
      )

      .trim();




    const questions =
      extractQuestions(
        questionPart
      );




    if (
      passage.length > 50 &&
      questions.length > 0
    ) {

      comprehensions.push({

        passage,

        questions

      });

    }

  });




  return comprehensions;
}



/* =========================================
   PARSE PDF
========================================= */

async function parsePDF(filePath) {

  const dataBuffer =
    fs.readFileSync(filePath);

  const data =
    await pdfParse(dataBuffer);

  return data.text;
}



/* =========================================
   MCQ SECTION PDF
========================================= */

function generateMCQSection(

  doc,

  title,

  questions,

  count

) {

  doc.addPage();




  doc

    .fontSize(20)

    .font("Helvetica-Bold")

    .text(title);




  doc.moveDown(1.5);




  const selectedQuestions =

    shuffleArray(questions)

      .slice(0, count);




  selectedQuestions.forEach(

    (q, index) => {

      if (doc.y > 700) {

        doc.addPage();

      }




      doc

        .fontSize(14)

        .font("Helvetica-Bold")

        .text(

          `${index + 1}. ${q.question}`,

          {
            width: 500,
            lineGap: 4
          }

        );




      doc.moveDown(0.5);




      q.options.forEach(opt => {

        doc

          .fontSize(12)

          .font("Helvetica")

          .text(

            opt,

            {
              indent: 20,
              width: 500,
              lineGap: 3
            }

          );




        doc.moveDown(0.3);

      });




      doc.moveDown(1);

    }

  );

}



/* =========================================
   ROUTE
========================================= */

router.post(

  "/generate",

  upload.fields([

    {
      name: "section1",
      maxCount: 1
    },

    {
      name: "section2",
      maxCount: 1
    },

    {
      name: "section3",
      maxCount: 1
    },

    {
      name: "section4",
      maxCount: 1
    },

    {
      name: "section5",
      maxCount: 1
    },

    {
      name: "section6",
      maxCount: 1
    }

  ]),

  async (req, res) => {

    try {

      const files = req.files;




      const numberOfSets =
        parseInt(req.body.numberOfSets);

      const section2Count =
        parseInt(req.body.section2Count);

      const section3Count =
        parseInt(req.body.section3Count);

      const section4Count =
        parseInt(req.body.section4Count);

      const section5Count =
        parseInt(req.body.section5Count);

      const section6Count =
        parseInt(req.body.section6Count);




      let section1Questions = [];
      let section2Comprehensions = [];
      let section3Comprehensions = [];
      let section4Questions = [];
      let section5Questions = [];
      let section6Questions = [];




      if (files.section1) {

        const text =
          await parsePDF(
            files.section1[0].path
          );

        section1Questions =
          extractPersonalQuestions(text);

      }




      if (files.section2) {

        const text =
          await parsePDF(
            files.section2[0].path
          );

        section2Comprehensions =
          extractComprehensions(text);

      }




      if (files.section3) {

        const text =
          await parsePDF(
            files.section3[0].path
          );

        section3Comprehensions =
          extractComprehensions(text);

      }




      if (files.section4) {

        const text =
          await parsePDF(
            files.section4[0].path
          );

        section4Questions =
          extractQuestions(text);

      }




      if (files.section5) {

        const text =
          await parsePDF(
            files.section5[0].path
          );

        section5Questions =
          extractQuestions(text);

      }




      if (files.section6) {

        const text =
          await parsePDF(
            files.section6[0].path
          );

        section6Questions =
          extractQuestions(text);

      }




      let generatedFiles = [];



      for (
        let set = 1;
        set <= numberOfSets;
        set++
      ) {

        const doc =
          new PDFDocument({

            margin: 50

          });

const fileName =
  `QuestionPaper_Set_${set}.pdf`;



// FULL ABSOLUTE PATH

const outputPath = path.join(
  __dirname,
  "../generated",
  fileName
);



// CREATE generated FOLDER IF NOT EXISTS

if (
  !fs.existsSync(
    path.join(__dirname, "../generated")
  )
) {

  fs.mkdirSync(

    path.join(__dirname, "../generated"),

    { recursive: true }

  );

}



// CREATE STREAM

const writeStream =
  fs.createWriteStream(outputPath);



// PIPE PDF

doc.pipe(writeStream);


        


        // TITLE

        doc

          .fontSize(24)

          .font("Helvetica-Bold")

          .text(

            `QUESTION PAPER - SET ${set}`,

            {

              align: "center"

            }

          );




        doc.moveDown(2);




        // SECTION 1

        doc

          .fontSize(20)

          .font("Helvetica-Bold")

          .text(
            "SECTION 1 - PERSONAL DATA"
          );




        doc.moveDown();




        section1Questions.forEach(
          (q, index) => {

            doc

              .fontSize(13)

              .font("Helvetica")

              .text(
                `${index + 1}. ${q.question}`
              );




            doc.moveDown(0.4);

            doc.text(
              "______________________________________"
            );

            doc.moveDown(0.3);

            doc.text(
              "______________________________________"
            );

            doc.moveDown(1);

          }
        );




        // SECTION 2

        doc.addPage();

        doc

          .fontSize(20)

          .font("Helvetica-Bold")

          .text(
            "SECTION 2 - COMPREHENSION PASSAGE"
          );




        doc.moveDown(1);




        const selectedComp2 =

          shuffleArray(
            section2Comprehensions
          )

          .slice(0, section2Count);




        selectedComp2.forEach(comp => {

          doc

            .fontSize(12)

            .font("Helvetica")

            .text(
              comp.passage,
              {
                align: "justify",
                lineGap: 4
              }
            );




          doc.moveDown(1);




          comp.questions.forEach(
            (q, index) => {

              doc

                .fontSize(14)

                .font("Helvetica-Bold")

                .text(
                  `${index + 1}. ${q.question}`
                );




              doc.moveDown(0.3);




              q.options.forEach(opt => {

                doc

                  .fontSize(12)

                  .font("Helvetica")

                  .text(opt);

              });




              doc.moveDown(1);

            }
          );




          doc.moveDown(2);

        });




        // SECTION 3

        doc.addPage();

        doc

          .fontSize(20)

          .font("Helvetica-Bold")

          .text(
            "SECTION 3 - COMPREHENSION PASSAGE"
          );




        doc.moveDown(1);




        const selectedComp3 =

          shuffleArray(
            section3Comprehensions
          )

          .slice(0, section3Count);




        selectedComp3.forEach(comp => {

          doc

            .fontSize(12)

            .font("Helvetica")

            .text(
              comp.passage,
              {
                align: "justify",
                lineGap: 4
              }
            );




          doc.moveDown(1);




          comp.questions.forEach(
            (q, index) => {

              doc

                .fontSize(14)

                .font("Helvetica-Bold")

                .text(
                  `${index + 1}. ${q.question}`
                );




              doc.moveDown(0.3);




              q.options.forEach(opt => {

                doc

                  .fontSize(12)

                  .font("Helvetica")

                  .text(opt);

              });




              doc.moveDown(1);

            }
          );




          doc.moveDown(2);

        });




        // SECTION 4

        generateMCQSection(

          doc,

          "SECTION 4 - ENGLISH APTITUDE",

          section4Questions,

          section4Count

        );




        // SECTION 5

        generateMCQSection(

          doc,

          "SECTION 5 - NUMERICAL APTITUDE",

          section5Questions,

          section5Count

        );




        // SECTION 6

        generateMCQSection(

          doc,

          "SECTION 6 - MARITIME KNOWLEDGE",

          section6Questions,

          section6Count

        );



doc.end();



// WAIT UNTIL FILE IS FULLY SAVED

await new Promise((resolve, reject) => {

  writeStream.on("finish", resolve);

  writeStream.on("error", reject);

});



generatedFiles.push(fileName);

      }




      res.json({

        message:
          "Question Papers Generated Successfully",

        files: generatedFiles

      });

    }

    catch (error) {

      console.log(error);

      res.status(500).json({

        message:
          "Error generating PDFs"

      });

    }

  }

);

module.exports = router;