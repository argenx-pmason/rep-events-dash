import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  //   Tooltip,
  //   Toolbar,
  //   IconButton,
  //   AppBar,
  //   Link,
  //   MenuItem,
  //   Menu,
} from "@mui/material";
import {
  DataGridPro,
  LicenseInfo,
  //   GridToolbar,
  // GridRowModes,
  // GridToolbarContainer,
  // GridActionsCellItem,
  // GridRowEditStopReasons,
  // GridToolbarExport,
} from "@mui/x-data-grid-pro";
// import { Info } from "@mui/icons-material";
// import { getJsonFile, formatBytes } from "./utility";
//   import "./App.css";

// apply the license for data grid
LicenseInfo.setLicenseKey(
  "369a1eb75b405178b0ae6c2b51263cacTz03MTMzMCxFPTE3MjE3NDE5NDcwMDAsUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI="
);
function TableDialog(props) {
  const {
      open,
      setOpenCmnts,
      data,
      title,
      columnWidths,
      columnSequence,
      labelSequence,
    } = props,
    [rows, setRows] = useState(null),
    [columns, setColumns] = useState(null);

  useEffect(() => {
    // console.log("data", data, props);
    if (data === null) return;
    const tempData = data.map((item, index) => {
      return { ...item, id: index };
    });
    setRows(tempData);
    const tempColumns = Object.keys(tempData[0]).map((key, i) => {
      // assign a sequence number to each column based on their order in columnSequence
      const sequence = columnSequence ? columnSequence.indexOf(key) + 1 : 0,
        label = labelSequence ? labelSequence[i] : key;
      return {
        field: key,
        headerName: label,
        width:
          columnWidths && columnWidths.length > i + 1 && columnWidths[i]
            ? columnWidths[i]
            : 120,
        sequence: sequence,
        cellClassName: (params) => {
          if (params.value === null) return "null-cell";
          if (typeof params.value === "number") return "number-cell";
          if (params.value === "All") return "all-cell";
          return "string-cell";
        },
        // format cell numeric values with commas
        valueFormatter: (params) => {
          if (typeof params.value === "number") {
            return params.value.toLocaleString();
          }
          return params.value;
        },
      };
    });
    tempColumns.sort((a, b) => a.sequence - b.sequence);
    console.log("tempData", tempData, "tempColumns", tempColumns);
    setColumns(tempColumns);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <Dialog
      open={open}
      onClose={() => setOpenCmnts(false)}
      fullWidth
      maxWidth="xl"
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ height: window.innerHeight - 300 }}>
          {rows && (
            <DataGridPro
              rows={rows}
              columns={columns}
              density="compact"
              getRowClassName={(params) =>
                params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
              }
              columnVisibilityModel={{
                id: false,
              }}
            />
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
export default TableDialog;
