import { useState, useEffect } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Tooltip,
  Toolbar,
  IconButton,
  AppBar,
  Link,
  MenuItem,
  Menu,
  Button,
  Chip,
} from "@mui/material";
import {
  DataGridPro,
  LicenseInfo,
  GridToolbar,
  // GridRowModes,
  // GridToolbarContainer,
  // GridActionsCellItem,
  // GridRowEditStopReasons,
  // GridToolbarExport,
} from "@mui/x-data-grid-pro";
import { Info, RocketLaunchTwoTone, RocketTwoTone } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import { getJsonFile, formatBytes } from "./utility";
import "./App.css";
import sampleMetaPlusLink from "./samples/metapluslink.json"; // made in LSAF --> /general/biostat/gadam/documents/gadam_dshb/gadam_jobs/gadam_jobs_info.sas
import sampleCmnts from "./samples/cmnts.json"; // made in LSAF --> /general/biostat/gadam/documents/gadam_dshb/gadam_jobs/gadam_jobs_info.sas
import sampleAllsumm from "./samples/allsumm.json"; // made in LSAF --> /general/biostat/gadam/documents/gadam_dshb/gadam_jobs/gadam_jobs_info.sas
import sampleAllsummtot from "./samples/allsummtot.json"; // made in LSAF --> /general/biostat/gadam/documents/gadam_dshb/gadam_jobs/gadam_jobs_info.sas
import sampleSapUpdates from "./samples/sap_updates.json"; // made in LSAF --> /general/biostat/jobs/dashboard/dev/programs/sapextract.sas
import TableDialog from "./TableDialog";
import links from "./links.json";

// apply the license for data grid
LicenseInfo.setLicenseKey(
  "369a1eb75b405178b0ae6c2b51263cacTz03MTMzMCxFPTE3MjE3NDE5NDcwMDAsUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI="
);

function App() {
  document.title = "Reporting Events";
  const { href } = window.location, // get the URL so we can work out where we are running
    mode = href.startsWith("http://localhost") ? "local" : "remote", // local or remote, which is then used for development and testing
    webDavPrefix = "https://xarprod.ondemand.sas.com/lsaf/webdav/repo", // prefix for webdav access to LSAF
    fileViewerPrefix =
      "https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd:/general/biostat/tools/fileviewer/index.html?file=",
    logViewerPrefix =
      "https://xarprod.ondemand.sas.com/lsaf/webdav/repo/general/biostat/tools/logviewer2/index.html",
    userJsonDir = webDavPrefix + "/general/biostat/metadata/projects", // location of JSON files on LSAF
    sapDir =
      webDavPrefix + "/general/biostat/jobs/dashboard/dev/output/sapxlsx", // location of SAP files on LSAF
    [stats, setStats] = useState({}), // stats about the data
    [openLotInfo, setOpenLotInfo] = useState(false), // shows dialog for LOT info
    [selectedLot, setSelectedLot] = useState(null), // data for selected LOT
    [openInfo, setOpenInfo] = useState(false), // shows dialog with info about this screen
    [openCmnts, setOpenCmnts] = useState(false), // shows comments dialog
    [openAllsumm, setOpenAllsumm] = useState(false), // shows allsumm dialog
    [openAllsummtot, setOpenAllsummtot] = useState(false), // shows allsummtot dialog
    [metaPlusLink, setMetaPlusLink] = useState(null), // data for main table
    [cmnts, setCmnts] = useState(null), // data for comments table
    [allsumm, setAllsumm] = useState(null), // data for allsumm table
    [allsummtot, setAllsummtot] = useState(null), // data for allsummtot table
    [allsumm2, setAllsumm2] = useState(null), // calculate some ratios
    [allsummtot2, setAllsummtot2] = useState(null), // calculate some ratios
    [sapUpdates, setSapUpdates] = useState(null), // data for sap updates
    columnSequence = [
      "id",
      "status",
      "compound",
      "indication",
      "study",
      "retype",
      "nreevents",
      "summfiles",
      "sizemb",
      "summsize",
      "bytesPerFile",
    ], // set sequence for columns in tables that use TableDialog
    topMargin = 50, // height of the AppBar
    iconWidth = 40, // width of the icons in the table
    green = "rgba(128, 255, 128, 0.5)",
    amber = "rgba(255, 255, 0, 0.2)",
    trans = "rgba(255, 255, 255, 0.3)",
    [anchorEl, setAnchorEl] = useState(null),
    handleClickMenu = (event) => {
      setAnchorEl(event.currentTarget);
    },
    handleCloseMenu = () => {
      setAnchorEl(null);
    },
    // links = [
    //   {
    //     name: "Old Reporting Event Dashboard",
    //     url: "https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd%3A///general/biostat/jobs/dashboard/dev/output/dashboard.html",
    //   },
    //   {
    //     name: "Search SAS programs",
    //     url: "https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd%3A///general/biostat/tools/search_sas_progs/search_sas_progs.html",
    //   },
    //   {
    //     name: "GADAM jobs",
    //     url: "https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd%3A///general/biostat/gadam/documents/gadam_dshb/gadam_jobs/jobs.html",
    //   },
    //   {
    //     name: "STAR documentation",
    //     url: "https://argenxbvba.sharepoint.com/sites/Biostatistics/Programming%20documentation/html-1.0/index.aspx",
    //   },
    //   {
    //     name: "Studies Summary",
    //     url: "https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd%3A///general/biostat/gadam/documents/gadam_dshb/study_info/studies_info.html",
    //   },
    //   {
    //     name: "GADAM Data Refresh Events",
    //     url: "https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd%3A///general/biostat/gadam/documents/gadam_dshb/gadam_events/gadam_dshb.html",
    //   },
    //   {
    //     name: "Insight - studies",
    //     url: "https://argenxbvba.sharepoint.com/sites/Biostatistics/insight/studies.aspx",
    //   },
    //   {
    //     name: "Insight - TLF bundles",
    //     url: "https://argenxbvba.sharepoint.com/sites/Biostatistics/Final%20TLF%20bundles/folder_tree.aspx",
    //   },
    //   {
    //     name: "Insight - AEs",
    //     url: "https://argenxbvba.sharepoint.com/sites/Biostatistics/insight/ae.aspx",
    //   },
    //   {
    //     name: "LSAF sync",
    //     url: "https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd%3A///general/biostat/tools/lsafsync/app/index.html",
    //   },
    // ],
    columnsMetaPlusLink = [
      {
        field: "compound",
        headerName: "Compound",
        width: 70,
        align: "left",
        headerAlign: "left",
        // type: "singleSelect",
        // editable: true,
        // valueOptions: indications,
      },
      { field: "indication", headerName: "Indication", width: 80 },
      { field: "study", headerName: "Study", width: 100 },
      { field: "re", headerName: "Reporting Event", width: 175 },
      {
        field: "reporting_event_path",
        headerName: "File Viewer",
        width: iconWidth,
        align: "center",
        headerAlign: "center",
        description: "Open file viewer for this reporting event",
        renderCell: (cellValues) => {
          const { value } = cellValues;
          if (value) {
            return (
              <Tooltip title={`Open fileviewer for ${value}`}>
                <IconButton
                  color="info"
                  onClick={() => {
                    window.open(fileViewerPrefix + value, "_blank").focus();
                  }}
                  sx={{ fontSize: "16px" }}
                >
                  {value.includes("figures")
                    ? "📊"
                    : value.includes("tlf")
                    ? "🧾"
                    : value.includes("adam")
                    ? "🧡"
                    : value.includes("profile")
                    ? "🤦"
                    : "👻"}
                </IconButton>
              </Tooltip>
            );
          } else return null;
        },
      },
      {
        field: "relink",
        headerName: "Old Dash",
        width: iconWidth,
        align: "center",
        headerAlign: "center",
        description: "Open old-style dashboard for this reporting event",
        renderCell: (cellValues) => {
          const { value } = cellValues;
          if (value) {
            return (
              <Tooltip title={`Open old study dashboard`}>
                <IconButton
                  color="info"
                  onClick={() => {
                    window.open(value, "_blank").focus();
                  }}
                  sx={{ fontSize: "16px" }}
                >
                  😷
                </IconButton>
              </Tooltip>
            );
          } else return null;
        },
      },
      {
        field: "relink_new",
        headerName: "New Dash",
        width: iconWidth,
        align: "center",
        headerAlign: "center",
        description: "Open new-style dashboard for this reporting event",
        renderCell: (cellValues) => {
          const { value } = cellValues;
          if (value) {
            return (
              <Tooltip title={`Open new study dashboard`}>
                <IconButton
                  color="info"
                  onClick={() => {
                    window.open(value, "_blank").focus();
                  }}
                  sx={{ fontSize: "16px" }}
                >
                  🦙
                </IconButton>
              </Tooltip>
            );
          } else return null;
        },
      },
      {
        field: "SharePoint_list",
        headerName: "SPlist",
        width: iconWidth,
        align: "center",
        headerAlign: "center",
        description: "Open SharePoint list for this reporting event",
        renderCell: (cellValues) => {
          const { value } = cellValues;
          if (value) {
            return (
              <Tooltip title={`Open SharePoint List`}>
                <IconButton
                  color="info"
                  onClick={() => {
                    window.open(value, "_blank").focus();
                  }}
                  sx={{ fontSize: "16px" }}
                >
                  📩
                </IconButton>
              </Tooltip>
            );
          } else return null;
        },
      },
      {
        field: "LOT",
        headerName: "LOT",
        width: iconWidth,
        align: "center",
        headerAlign: "center",
        description:
          "Open LOT spreadsheet for this reporting event (if it exists)",
        renderCell: (cellValues) => {
          const { value, row } = cellValues,
            { reporting_event_path } = row;
          if (value) {
            return (
              <Tooltip title={`Open LOT spreadsheet: ${value}`}>
                <IconButton
                  color="info"
                  onClick={() => {
                    window
                      .open(
                        fileViewerPrefix +
                          reporting_event_path +
                          "/documents/" +
                          value,
                        "_blank"
                      )
                      .focus();
                  }}
                  sx={{ fontSize: "10px" }}
                >
                  🟢
                </IconButton>
              </Tooltip>
            );
          } else return null;
        },
      },
      {
        field: "LOT_sheet",
        headerName: "SAP",
        width: iconWidth,
        align: "center",
        headerAlign: "center",
        description: "Review LOT spreadsheet automatically generated from SAP",
        renderCell: (cellValues) => {
          const { value, row } = cellValues,
            { reporting_event_path } = row,
            expectedPathLot = reporting_event_path
              .split("/")
              .slice(0, -1)
              .join("/");
          console.log("row", row);
          console.log("sapUpdates", sapUpdates);
          console.log("expectedPathLot", expectedPathLot);
          if (sapUpdates && value) {
            // see if we have a match from the list of LOTs
            const match = sapUpdates.find((row) => {
              const path = row.xlsx.split("/").slice(0, -2).join("/");
              return path === expectedPathLot;
            });
            if (match) console.log("match", match);
            let checked = null,
              date = "";
            if (match) {
              checked = match.checked;
              date = " (Created on " + match.date + ")";
            }
            console.log("checked", checked);
            return (
              <Tooltip
                title={
                  checked === null
                    ? "Automatically generated LOT workbook was not found"
                    : `Review automatically generated LOT workbook ${date}`
                }
              >
                <IconButton
                  color="info"
                  onClick={() => {
                    if (checked !== null) {
                      setSelectedLot(match);
                      setOpenLotInfo(true);
                    }
                  }}
                  sx={{ fontSize: "10px" }}
                >
                  {checked === null ? "▫" : checked === 1 ? "✅" : "❎"}
                </IconButton>
              </Tooltip>
            );
          } else return null;
        },
      },
      {
        field: "logcheck",
        headerName: "Log",
        width: 140,
        align: "center",
        headerAlign: "center",
        description:
          "Open log viewer for log used to create dashboard for this reporting event",
        renderCell: (cellValues) => {
          const { value, row } = cellValues;
          let color = trans;
          if (value !== "clean") color = amber;
          if (row.hrefdblog) {
            return (
              <Box sx={{ flex: 1, backgroundColor: color }}>
                <Tooltip title={`Open log viewer`}>
                  <Link
                    href={logViewerPrefix + "?file=" + row.hrefdblog}
                    target="_blank"
                    rel="noreferrer"
                    sx={{ fontSize: "10px" }}
                  >
                    {value}
                  </Link>
                </Tooltip>
              </Box>
            );
          } else return null;
        },
      },
      {
        field: "refrmsg",
        headerName: "Need recheck by DB?",
        width: 50,
      },
      {
        field: "dateLastModified",
        headerName: "Date last modified",
        width: 100,
        renderCell: (cellValues) => {
          const { value } = cellValues;
          return <Box sx={{ fontSize: "10px" }}>{value}</Box>;
        },
      },
      {
        field: "reldays",
        headerName: "Days since last modified",
        width: 70,
        renderCell: (cellValues) => {
          const { value } = cellValues;
          let color = trans;
          if (value > 28) color = amber;
          return <Box sx={{ flex: 1, backgroundColor: color }}>{value}</Box>;
        },
      },
      {
        field: "daysactive",
        headerName: "Days last modified - creation",
        width: 70,
      },
      {
        field: "expectedpgm",
        headerName: "Progs Expected",
        width: 60,
        renderCell: (cellValues) => {
          const { row, value } = cellValues;
          let color = trans;
          if (row.createdpgm === value) color = green;
          return <Box sx={{ flex: 1, backgroundColor: color }}>{value}</Box>;
        },
      },
      {
        field: "createdpgm",
        headerName: "Progs Created",
        width: 60,
        renderCell: (cellValues) => {
          const { row, value } = cellValues;
          let color = trans;
          if (row.expectedpgm === value) color = green;
          return <Box sx={{ flex: 1, backgroundColor: color }}>{value}</Box>;
        },
      },
      {
        field: "issuepgm",
        headerName: "Progs With issues",
        width: 60,
        renderCell: (cellValues) => {
          const { value } = cellValues;
          let color = trans;
          if (value > 0) color = amber;
          return <Box sx={{ flex: 1, backgroundColor: color }}>{value}</Box>;
        },
      },
      {
        field: "expectedoutput",
        headerName: "Outputs Expected",
        width: 60,
        renderCell: (cellValues) => {
          const { row, value } = cellValues;
          let color = trans;
          if (row.createdoutput === value) color = green;
          return <Box sx={{ flex: 1, backgroundColor: color }}>{value}</Box>;
        },
      },
      {
        field: "createdoutput",
        headerName: "Outputs Created",
        width: 60,
        renderCell: (cellValues) => {
          const { row, value } = cellValues;
          let color = trans;
          if (row.expectedoutput === value) color = green;
          return <Box sx={{ flex: 1, backgroundColor: color }}>{value}</Box>;
        },
      },
      {
        field: "issueoutput",
        headerName: "Outputs With issues",
        width: 60,
        renderCell: (cellValues) => {
          const { value } = cellValues;
          let color = trans;
          if (value > 0) color = amber;
          return <Box sx={{ flex: 1, backgroundColor: color }}>{value}</Box>;
        },
      },
      { field: "nbfiles", headerName: "Number of files", width: 60 },
      {
        field: "allsaspgm",
        headerName: "SAS progs",
        width: 60,
        description: "Number of SAS programs",
      },
      { field: "alllst", headerName: "Listings", width: 60 },
      {
        field: "dateCreated",
        headerName: "Date created",
        width: 100,
        renderCell: (cellValues) => {
          const { value } = cellValues;
          return <Box sx={{ fontSize: "10px" }}>{value}</Box>;
        },
      },
      {
        field: "nameLastModified",
        headerName: "Name Last Modified",
        width: 120,
        renderCell: (cellValues) => {
          const { value } = cellValues;
          return <Box sx={{ fontSize: "10px" }}>{value}</Box>;
        },
      },
      {
        field: "totalsize",
        headerName: "Total Size",
        renderCell: (cellValues) => {
          const { value } = cellValues;
          return formatBytes(value);
        },
      },
      // { field: "hrefdblog", headerName: "Dash log file" },
    ];

  // load initial files
  useEffect(() => {
    if (mode === "local") {
      console.log("loading local data");
      setMetaPlusLink(sampleMetaPlusLink); // sample data for development/testing
      setCmnts(sampleCmnts); // sample data for development/testing
      setAllsumm(sampleAllsumm); // sample data for development/testing
      setAllsummtot(sampleAllsummtot); // sample data for development/testing
      setSapUpdates(sampleSapUpdates); // sample data for development/testing
    } else {
      getJsonFile(userJsonDir + "/metapluslink.json", setMetaPlusLink); // data for main table
      getJsonFile(userJsonDir + "/cmnts.json", setCmnts); // data for comments table
      getJsonFile(userJsonDir + "/allsumm.json", setAllsumm); // data for allsumm table
      getJsonFile(userJsonDir + "/allsummtot.json", setAllsummtot); // data for allsummtot table
      getJsonFile(sapDir + "/sap_updates.json", setSapUpdates);
    }
  }, [mode, userJsonDir, sapDir]);

  // modify data to calculate some ratios
  useEffect(() => {
    if (allsumm === null || allsummtot === null) return;
    const tempAllsummtot2 = allsummtot.map((row) => {
      const bytesPerFile = row.summsize / row.summfiles;
      return { ...row, bytesPerFile: bytesPerFile };
    });
    setAllsummtot2(tempAllsummtot2);
    const tempAllsumm2 = allsumm.map((row) => {
      const bytesPerFile = row.summsize / row.summfiles;
      return { ...row, bytesPerFile: bytesPerFile };
    });
    setAllsumm2(tempAllsumm2);
  }, [allsumm, allsummtot]);

  // gather some stats
  useEffect(() => {
    if (metaPlusLink === null) return;
    const repEvents = metaPlusLink.length,
      dashboards = metaPlusLink.filter((row) => row.relink_new > " ").length,
      totalProgs = metaPlusLink.reduce((acc, row) => acc + row.createdpgm, 0),
      totalOutputs = metaPlusLink.reduce(
        (acc, row) => acc + row.createdoutput,
        0
      );
    const tempStats = {
      repEvents: repEvents,
      dashboards: dashboards,
      totalProgs: totalProgs,
      totalOutputs: totalOutputs,
    };
    console.log(tempStats);
    setStats(tempStats);
  }, [metaPlusLink]);

  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar variant="dense">
          <Tooltip title="Useful links">
            <IconButton
              edge="start"
              color="inherit"
              sx={{ mr: 2 }}
              onClick={handleClickMenu}
              aria-label="menu"
              aria-controls={Boolean(anchorEl) ? "View a table" : undefined}
              aria-haspopup="true"
              aria-expanded={Boolean(anchorEl) ? "true" : undefined}
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>
          <Box color="inherit">Reporting Events Dashboard</Box>
          <Box sx={{ flexGrow: 1 }}></Box>
          {cmnts && (
            <Tooltip title={`View ${cmnts.length} issues found`}>
              <IconButton
                onClick={() => {
                  setOpenCmnts(true);
                }}
                color="inherit"
                sx={{
                  // mt: 0.75,
                  fontSize: "1em",
                  backgroundColor: "#990000",
                  border: 0.5,
                  padding: 0.5,
                }}
              >
                {cmnts.length}
              </IconButton>
            </Tooltip>
          )}
          {allsummtot && (
            <Tooltip title="View overview of file sizes">
              <IconButton
                onClick={() => {
                  setOpenAllsummtot(true);
                }}
                color="inherit"
                sx={{
                  // mt: 0.75,
                  fontSize: "0.8em",
                  borderColor: "primary.main",
                  border: 0.5,
                  padding: 0.25,
                  ml: 2,
                }}
              >
                <RocketLaunchTwoTone />
              </IconButton>
            </Tooltip>
          )}
          {allsumm && (
            <Tooltip title="View reporting event file sizes">
              <IconButton
                onClick={() => {
                  setOpenAllsumm(true);
                }}
                color="inherit"
                sx={{
                  // mt: 0.75,
                  fontSize: "0.8em",
                  borderColor: "primary.main",
                  border: 0.5,
                  padding: 0.25,
                  ml: 2,
                }}
              >
                <RocketTwoTone />
              </IconButton>
            </Tooltip>
          )}
          <Box
            sx={{ flexGrow: 0.5, fontSize: "0.8em", textAlign: "right" }}
          >{`Active Reporting Events (${stats.repEvents}), with dashboard (${stats.dashboards}) - Total created SAS programs: ${stats.totalProgs} - Total created outputs: ${stats.totalOutputs}`}</Box>
          <Tooltip title="Information about this screen">
            <IconButton
              color="inherit"
              // sx={{ mr: 2 }}
              onClick={() => {
                setOpenInfo(true);
              }}
            >
              <Info />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          height: window.innerHeight - topMargin,
          width: "100%",
          "& .actions": {
            color: "text.secondary",
          },
          "& .textPrimary": {
            color: "text.primary",
          },
        }}
      >
        {metaPlusLink && (
          <DataGridPro
            rows={metaPlusLink}
            columns={columnsMetaPlusLink}
            density="compact"
            editMode="row"
            // rowHeight={30}
            sx={{
              // height: windowDimension.winHeight - topMargin,
              fontFamily: "system-ui;",
              fontWeight: "fontSize=5",
              fontSize: "0.7em",
              padding: 0.1,
              "& .MuiDataGrid-columnHeaderTitle": {
                whiteSpace: "normal",
                lineHeight: "normal",
              },
              "& .MuiDataGrid-columnHeader": {
                // Forced to use important since overriding inline styles
                height: "unset !important",
              },
              "& .MuiDataGrid-columnHeaders": {
                // Forced to use important since overriding inline styles
                maxHeight: "168px !important",
              },
              "& .MuiDataGrid-cell": {
                // Forced to use important since overriding inline styles
                whiteSpace: "unset !important",
              },
              "& .green": {
                backgroundColor: green,
                color: "#000000",
              },
            }}
            getRowClassName={(params) =>
              params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
            }
            getRowId={(row) => row.reporting_event_path}
            disableColumnFilter
            disableColumnSelector
            disableDensitySelector
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
              },
            }}
            // autoHeight={true}
            // rowModesModel={rowModesModel}
            // onRowModesModelChange={handleRowModesModelChange}
            // onRowEditStop={handleRowEditStop}
            // processRowUpdate={processRowUpdate}
            // slots={{
            //   toolbar: EditToolbar,
            // }}
            // slotProps={{
            //   toolbar: { setRows, setRowModesModel },
            // }}
          />
        )}
        <Menu
          anchorEl={anchorEl}
          id="link-menu"
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          onClick={handleCloseMenu}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          {links.map((t, id) => (
            <MenuItem key={"menuItem" + id} onClick={handleCloseMenu}>
              <Tooltip key={"tt" + id}>
                <Box
                  color={"success"}
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    window.open(t.url, "_blank").focus();
                    // handleCloseMenu();
                  }}
                  // sx={{ mb: 1 }}
                >
                  {t.name}
                </Box>
              </Tooltip>
            </MenuItem>
          ))}
        </Menu>
        {/* Display dialog with table of comments */}
        <TableDialog
          open={openCmnts}
          setOpenCmnts={setOpenCmnts}
          title={"Comments from analysis of Reporting Events"}
          data={cmnts}
          columnSequence={[
            "reporting_event_path",
            "dbnote",
            "nameLastModified",
            "id",
          ]}
          labelSequence={[
            "Reporting event path",
            "Message",
            "Name Last Modified",
            "id",
          ]}
          columnWidths={[500, 250, 400, 50]}
        />
        <TableDialog
          open={openAllsummtot}
          setOpenCmnts={setOpenAllsummtot}
          title={"Stats on size of files in Reporting Events"}
          data={allsummtot2}
          columnSequence={columnSequence}
          labelSequence={[
            "Nb Reporting events",
            "Nb Files",
            "Total size",
            "Status",
            "Compound",
            "Indication",
            "Study",
            "Reporting event type",
            "Total size (MB)",
            "Bytes per file",
          ]}
          columnWidths={[159, 92, 150, 120, 85, 95, 151, 152, 122, 123, 124]}
        />
        <TableDialog
          open={openAllsumm}
          setOpenCmnts={setOpenAllsumm}
          title={"Stats on size of files in Reporting Event Types"}
          data={allsumm2}
          columnSequence={columnSequence}
          labelSequence={[
            "Status",
            "Compound",
            "Indication",
            "Study",
            "Reporting event type",
            "Nb Reporting events",
            "Nb Files",
            "Total size",
            "Total size (MB)",
            "Bytes per file",
          ]}
          columnWidths={[120, 90, 91, 150, 152, 141, 93, 122, 124, 50]}
        />
        {/* Dialog with General info about this screen */}
        <Dialog
          fullWidth
          maxWidth="xl"
          onClose={() => setOpenInfo(false)}
          open={openInfo}
          title={"Comments from analysis"}
          data={cmnts}
        >
          <DialogTitle>Info about this screen</DialogTitle>
          <DialogContent>
            <ul>
              <li>
                Data for this report is produced by the SAS program{" "}
                <a
                  href="https://xarprod.ondemand.sas.com/lsaf/webdav/repo/general/biostat/tools/fileviewer/index.html?file=/general/biostat/gadam/documents/gadam_dshb/gadam_jobs/gadam_jobs_info.sas"
                  target="_blank"
                  rel="noreferrer"
                >
                  gadam_jobs_info
                </a>
              </li>
              <li>
                The SAS program creates several JSON files which are then used
                with this app:
              </li>
              <ul>
                <li>
                  <a
                    href="https://xarprod.ondemand.sas.com/lsaf/webdav/repo/general/biostat/tools/fileviewer/index.html?file=https://xarprod.ondemand.sas.com/lsaf/webdav/repo/general/biostat/metadata/projects/metapluslink.json"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Data for the main table
                  </a>
                </li>
                <li>
                  <a
                    href="https://xarprod.ondemand.sas.com/lsaf/webdav/repo/general/biostat/tools/fileviewer/index.html?file=https://xarprod.ondemand.sas.com/lsaf/webdav/repo/general/biostat/metadata/projects/cmnts.json"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Data for issues found
                  </a>
                </li>
                <li>
                  <a
                    href="https://xarprod.ondemand.sas.com/lsaf/webdav/repo/general/biostat/tools/fileviewer/index.html?file=https://xarprod.ondemand.sas.com/lsaf/webdav/repo/general/biostat/metadata/projects/allsummtot.json"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Data for summary of space used by reporting events
                  </a>
                </li>
                <li>
                  <a
                    href="https://xarprod.ondemand.sas.com/lsaf/webdav/repo/general/biostat/tools/fileviewer/index.html?file=https://xarprod.ondemand.sas.com/lsaf/webdav/repo/general/biostat/metadata/projects/allsumm.json"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Data for space used for each reporting event
                  </a>
                </li>
              </ul>
            </ul>
            <Tooltip title={"Email technical programmers"}>
              <Button
                sx={{
                  color: "blue",
                  border: 1,
                  borderColor: "blue",
                  borderRadius: 1,
                  padding: 0.4,
                  float: "right",
                }}
                onClick={() => {
                  window.open(
                    "mailto:qs_tech_prog@argenx.com?subject=Question&body=This email was sent from: " +
                      encodeURIComponent(href) +
                      "%0D%0A%0D%0AMy question is:",
                    "_blank"
                  );
                }}
              >
                Email
              </Button>
            </Tooltip>
          </DialogContent>
        </Dialog>
        {/* Dialog for automatically generated LOT workbook */}
        <Dialog
          fullWidth
          maxWidth="xl"
          onClose={() => setOpenLotInfo(false)}
          open={openLotInfo}
          title={"Automatically generated LOT workbook info"}
        >
          <DialogTitle>LOT spreadsheet info</DialogTitle>
          <DialogContent>
            {selectedLot && (
              <Box>
                The LOT workbook was created on
                <b> {selectedLot.date}</b> at <b>{selectedLot.time}</b> from an
                SAP (word document). Currently the way to mark the LOT as
                checked OK, is to examine the SAP document and the LOT workbook
                and then toggle the "checked" flag by downloading the JSON file,
                editing it and uploading it. This will be automated in the
                future.
                <p />
                <Tooltip title={"View SAP word document"}>
                  <Button
                    sx={{
                      color: "blue",
                      border: 1,
                      borderColor: "blue",
                      borderRadius: 1,
                      padding: 0.4,
                      // float: "right",
                    }}
                    onClick={() => {
                      window
                        .open(
                          "https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd:" +
                            selectedLot.docx,
                          "_blank"
                        )
                        .focus();
                    }}
                  >
                    View SAP Document
                  </Button>
                </Tooltip>
                <Tooltip title={"View LOT workbook"}>
                  <Button
                    sx={{
                      ml: 2,
                      mr: 2,
                      color: "blue",
                      border: 1,
                      borderColor: "blue",
                      borderRadius: 1,
                      padding: 0.4,
                      // float: "right",
                    }}
                    onClick={() => {
                      window
                        .open(
                          "https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd:" +
                            selectedLot.xlsx,
                          "_blank"
                        )
                        .focus();
                    }}
                  >
                    View LOT Spreadsheet
                  </Button>
                </Tooltip>
                <Tooltip
                  title={
                    "NOT YET IMPLEMENTED: Toggle checked after you have checked the LOT and verified it is OK"
                  }
                >
                  <Chip
                    label={
                      selectedLot.checked
                        ? "LOT has been checked, and is OK"
                        : "LOT has not been checked"
                    }
                    color={selectedLot.checked ? "success" : "error"}
                    onClick={() => {
                      console.log('TODO: implement toggle of "checked" flag');
                    }}
                  />
                </Tooltip>
                <Tooltip title={"Download the SAP updates JSON file"}>
                  <Button
                    sx={{
                      ml: 2,
                      mr: 2,
                      color: "blue",
                      border: 1,
                      borderColor: "blue",
                      borderRadius: 1,
                      padding: 0.4,
                      // float: "right",
                    }}
                    onClick={() => {
                      window
                        .open(sapDir + "/sap_updates.json", "_blank")
                        .focus();
                    }}
                  >
                    🔽
                  </Button>
                </Tooltip>
                <Tooltip title={"View the SAP updates JSON file"}>
                  <Button
                    sx={{
                      ml: 2,
                      mr: 2,
                      color: "blue",
                      border: 1,
                      borderColor: "blue",
                      borderRadius: 1,
                      padding: 0.4,
                      // float: "right",
                    }}
                    onClick={() => {
                      window
                        .open(
                          fileViewerPrefix + sapDir + "/sap_updates.json",
                          "_blank"
                        )
                        .focus();
                    }}
                  >
                    🔍
                  </Button>
                </Tooltip>
              </Box>
            )}
          </DialogContent>
        </Dialog>{" "}
        )
      </Box>
    </div>
  );
}

export default App;
