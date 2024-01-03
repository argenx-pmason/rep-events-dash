export const setSapCheck = (selectedLot, url, value, setMessage) => {
  console.log(
    "setSapCheck - value: ",
    value,
    "url:",
    url,
    "selectedLot: ",
    selectedLot
  );
  let rows = [];
  // read the JSON file
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      // setRows(data);
      rows = data.map((d, i) => ({ ...d, id: i })); // add an id field to each row
      console.log("rows", rows);
      // update the item using xlsx as the key
      const updatedRows = rows.map((r) => {
        if (r.xlsx === selectedLot.xlsx) {
          return { ...r, checked: value.toString() };
        } else {
          return r;
        }
      });
      console.log("updatedRows", updatedRows);
      // write the JSON file
      updateJsonFile(url, updatedRows, setMessage);
      console.log("updateJsonFile(", url, updatedRows, ")");
    });
};

export const updateJsonFile = (file, content, setMessage) => {
  console.log("updateJsonFile - file:", file, "content:", content);
  if (!file || !content) return;
  // drop id from each row in content
  const contentWithoutId = content.map((c) => {
    delete c.id;
    return c;
  });
  // try to delete the file, in case it is there already, otherwise the PUT will not work
  fetch(file, {
    method: "DELETE",
  })
    .then((response) => {
      console.log("response", response);
      fetch(file, {
        method: "PUT",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify(contentWithoutId),
      })
        .then((response) => {
          setMessage(response.ok ? "File saved" : "File not saved");
          // setOpenSnackbar(true);
          console.log("response", response);
          response.text().then(function (text) {
            console.log("text", text);
          });
        })
        .catch((err) => {
          setMessage(err);
          // setOpenSnackbar(true);
          console.log("PUT err: ", err);
        });
    })
    .catch((err) => {
      setMessage(
        "DELETE was attempted before the new version was saved - but the DELETE failed. (see console)"
      );
      // setOpenSnackbar(true);
      console.log("DELETE err: ", err);
    });
};
