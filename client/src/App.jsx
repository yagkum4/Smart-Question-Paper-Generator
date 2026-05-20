import { useState } from "react";
import axios from "axios";

function App() {

  /* =====================================
     FILE STATES
  ===================================== */

  const [section1File, setSection1File] =
    useState(null);

  const [section2File, setSection2File] =
    useState(null);

  const [section3File, setSection3File] =
    useState(null);

  const [section4File, setSection4File] =
    useState(null);

  const [section5File, setSection5File] =
    useState(null);

  const [section6File, setSection6File] =
    useState(null);



  /* =====================================
     INPUT STATES
  ===================================== */

  const [numberOfSets, setNumberOfSets] =
    useState("");

  const [section2Count, setSection2Count] =
    useState("");

  const [section3Count, setSection3Count] =
    useState("");

  const [section4Count, setSection4Count] =
    useState("");

  const [section5Count, setSection5Count] =
    useState("");

  const [section6Count, setSection6Count] =
    useState("");



  /* =====================================
     GENERATED FILES
  ===================================== */

  const [generatedFiles, setGeneratedFiles] =
    useState([]);




  /* =====================================
     GENERATE QUESTION PAPERS
  ===================================== */

  const handleGenerate = async () => {

    try {

      const formData = new FormData();




      // FILES

      formData.append(
        "section1",
        section1File
      );

      formData.append(
        "section2",
        section2File
      );

      formData.append(
        "section3",
        section3File
      );

      formData.append(
        "section4",
        section4File
      );

      formData.append(
        "section5",
        section5File
      );

      formData.append(
        "section6",
        section6File
      );




      // COUNTS

      formData.append(
        "numberOfSets",
        numberOfSets
      );

      formData.append(
        "section2Count",
        section2Count
      );

      formData.append(
        "section3Count",
        section3Count
      );

      formData.append(
        "section4Count",
        section4Count
      );

      formData.append(
        "section5Count",
        section5Count
      );

      formData.append(
        "section6Count",
        section6Count
      );




      const res = await axios.post(

        "https://question-paper-backend-9apn.onrender.com/api/questions/generate",

        formData,

        {
          headers: {
            "Content-Type":
              "multipart/form-data"
          }
        }

      );




      setGeneratedFiles(
        res.data.files
      );




      alert(
        "Question Papers Generated Successfully"
      );

    }

    catch (err) {

      console.log(err);

      alert(
        "Error generating PDFs"
      );
    }

  };



  return (

    <div
      style={{
        minHeight: "100vh",
        background: "#eef2ff",
        padding: "30px",
        fontFamily: "Arial"
      }}
    >

      {/* MAIN CONTAINER */}

      <div
        style={{
          maxWidth: "1200px",
          margin: "auto",
          background: "#ffffff",
          borderRadius: "18px",
          padding: "35px",
          boxShadow:
            "0 8px 25px rgba(0,0,0,0.08)"
        }}
      >

        {/* TITLE */}

        <h1
          style={{
            textAlign: "center",
            color: "#1e3a8a",
            marginBottom: "35px",
            fontSize: "42px"
          }}
        >
          Smart Question Paper Generator
        </h1>



        {/* =====================================
           UPLOAD SECTION
        ===================================== */}

        <h2
          style={{
            marginBottom: "20px",
            color: "#0f172a"
          }}
        >
          Upload PDFs
        </h2>



        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(280px,1fr))",
            gap: "22px",
            marginBottom: "40px"
          }}
        >

          {[
            {
              title:
                "Section 1 – Personal Data",
              setter:
                setSection1File
            },

            {
              title:
                "Section 2 – Comprehension",
              setter:
                setSection2File
            },

            {
              title:
                "Section 3 – Comprehension",
              setter:
                setSection3File
            },

            {
              title:
                "Section 4 – English Aptitude",
              setter:
                setSection4File
            },

            {
              title:
                "Section 5 – Numerical Aptitude",
              setter:
                setSection5File
            },

            {
              title:
                "Section 6 – Maritime Knowledge",
              setter:
                setSection6File
            }

          ].map((section, index) => (

            <div
              key={index}
              style={{
                background: "#f8fafc",
                padding: "22px",
                borderRadius: "14px",
                border:
                  "1px solid #dbeafe"
              }}
            >

              <h3
                style={{
                  marginBottom: "15px",
                  color: "#1e293b",
                  fontSize: "18px"
                }}
              >
                {section.title}
              </h3>

              <input
                type="file"
                accept=".pdf"
                onChange={(e) =>
                  section.setter(
                    e.target.files[0]
                  )
                }
                style={{
                  width: "100%"
                }}
              />

            </div>

          ))}

        </div>



        {/* =====================================
           QUESTION SETTINGS
        ===================================== */}

        <h2
          style={{
            marginBottom: "20px",
            color: "#0f172a"
          }}
        >
          Question Settings
        </h2>



        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(250px,1fr))",
            gap: "22px"
          }}
        >

          {[
            {
              label:
                "Number Of Sets",
              value:
                numberOfSets,
              setter:
                setNumberOfSets
            },

            {
              label:
                "Section 2 Comprehensions",
              value:
                section2Count,
              setter:
                setSection2Count
            },

            {
              label:
                "Section 3 Comprehensions",
              value:
                section3Count,
              setter:
                setSection3Count
            },

            {
              label:
                "Section 4 Questions",
              value:
                section4Count,
              setter:
                setSection4Count
            },

            {
              label:
                "Section 5 Questions",
              value:
                section5Count,
              setter:
                setSection5Count
            },

            {
              label:
                "Section 6 Questions",
              value:
                section6Count,
              setter:
                setSection6Count
            }

          ].map((item, index) => (

            <div
              key={index}
              style={{
                background: "#f8fafc",
                padding: "20px",
                borderRadius: "14px",
                border:
                  "1px solid #dbeafe"
              }}
            >

              <label
                style={{
                  display: "block",
                  marginBottom: "10px",
                  fontWeight: "bold",
                  color: "#334155"
                }}
              >
                {item.label}
              </label>

              <input
                type="text"
                placeholder="Enter Number"
                value={item.value}
                onChange={(e) =>
                  item.setter(
                    e.target.value
                  )
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  border:
                    "1px solid #cbd5e1",
                  fontSize: "15px",
                  outline: "none"
                }}
              />

            </div>

          ))}

        </div>



        {/* =====================================
           BUTTON
        ===================================== */}

        <div
          style={{
            textAlign: "center",
            marginTop: "45px"
          }}
        >

          <button

            onClick={handleGenerate}

            style={{
              background:
                "linear-gradient(to right,#2563eb,#1d4ed8)",
              color: "#fff",
              border: "none",
              padding:
                "15px 55px",
              fontSize: "18px",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Generate Question Papers
          </button>

        </div>



        {/* =====================================
           GENERATED FILES
        ===================================== */}

        {generatedFiles.length > 0 && (

          <div
            style={{
              marginTop: "50px"
            }}
          >

            <h2
              style={{
                marginBottom: "20px",
                color: "#0f172a"
              }}
            >
              Generated Sets
            </h2>



            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(220px,1fr))",
                gap: "20px"
              }}
            >

              {generatedFiles.map(
                (file, index) => (

                  <div
                    key={index}
                    style={{
                      background:
                        "#f8fafc",
                      padding: "25px",
                      borderRadius:
                        "14px",
                      textAlign:
                        "center",
                      border:
                        "1px solid #dbeafe"
                    }}
                  >

                    <h3
                      style={{
                        marginBottom:
                          "18px",
                        color:
                          "#1e293b"
                      }}
                    >
                      Question Paper Set {index + 1}
                    </h3>



                    <a

                      href={`https://question-paper-backend-9apn.onrender.com/generated/${file}`}

                      target="_blank"

                      rel="noopener noreferrer"

                      download

                      style={{
                        display:
                          "inline-block",
                        background:
                          "#2563eb",
                        color: "#fff",
                        padding:
                          "12px 18px",
                        borderRadius:
                          "10px",
                        textDecoration:
                          "none",
                        fontWeight:
                          "bold"
                      }}
                    >
                      Download PDF
                    </a>

                  </div>

                )
              )}

            </div>

          </div>

        )}

      </div>

    </div>

  );

}

export default App;