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
import { Info } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import { getJsonFile, formatBytes } from "./utility";
import "./App.css";
import sampleMetaPlusLink from "./samples/metapluslink.json"; // made in LSAF --> /general/biostat/gadam/documents/gadam_dshb/gadam_jobs/gadam_jobs_info.sas

// apply the license for data grid
LicenseInfo.setLicenseKey(
  "369a1eb75b405178b0ae6c2b51263cacTz03MTMzMCxFPTE3MjE3NDE5NDcwMDAsUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI="
);

function App() {
  const { href } = window.location, // get the URL so we can work out where we are running
    mode = href.startsWith("http://localhost") ? "local" : "remote", // local or remote, which is then used for development and testing
    webDavPrefix = "https://xarprod.ondemand.sas.com/lsaf/webdav/repo", // prefix for webdav access to LSAF
    fileViewerPrefix =
      "https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd:/general/biostat/tools/fileviewer/index.html?file=",
    logViewerPrefix =
      "https://xarprod.ondemand.sas.com/lsaf/webdav/repo/general/biostat/tools/logviewer/index.html",
    userJsonDir = webDavPrefix + "/general/biostat/metadata/projects", // location of JSON files on LSAF
    [stats, setStats] = useState({}), // stats about the data
    [openInfo, setOpenInfo] = useState(false), // shows dialog with info about this screen
    [metaPlusLink, setMetaPlusLink] = useState(null), // data for main table
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
    links = [
      {
        name: "Old Reporting Event Dashboard",
        url: "https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd%3A///general/biostat/jobs/dashboard/dev/output/dashboard.html",
      },
      {
        name: "Search SAS programs",
        url: "https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd%3A///general/biostat/tools/search_sas_progs/search_sas_progs.html",
      },
      {
        name: "GADAM jobs",
        url: "https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd%3A///general/biostat/gadam/documents/gadam_dshb/gadam_jobs/jobs.html",
      },
      {
        name: "STAR documentation",
        url: "https://argenxbvba.sharepoint.com/sites/Biostatistics/Programming%20documentation/html-1.0/index.aspx",
      },
      {
        name: "Studies Summary",
        url: "https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd%3A///general/biostat/gadam/documents/gadam_dshb/study_info/studies_info.html",
      },
      {
        name: "GADAM Data Refresh Events",
        url: "https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd%3A///general/biostat/gadam/documents/gadam_dshb/gadam_events/gadam_dshb.html",
      },
      {
        name: "Insight - studies",
        url: "https://argenxbvba.sharepoint.com/sites/Biostatistics/insight/studies.aspx",
      },
      {
        name: "Insight - TLF bundles",
        url: "https://argenxbvba.sharepoint.com/sites/Biostatistics/Final%20TLF%20bundles/folder_tree.aspx",
      },
      {
        name: "Insight - AEs",
        url: "https://argenxbvba.sharepoint.com/sites/Biostatistics/insight/ae.aspx",
      },
      {
        name: "LSAF sync",
        url: "https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd%3A///general/biostat/tools/lsafsync/app/index.html",
      },
    ],
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
        description: "Open LOT spreadsheet for this reporting event",
        renderCell: (cellValues) => {
          const { value, row } = cellValues;
          // console.log(cellValues)
          if (value) {
            return (
              <Tooltip title={`Open LOT spreadsheet: ${value}`}>
                <IconButton
                  color="info"
                  onClick={() => {
                    window
                      .open(
                        fileViewerPrefix +
                          row.reporting_event_path +
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
      setMetaPlusLink(sampleMetaPlusLink); // sample data for development/testing
    } else {
      getJsonFile(userJsonDir + "/metapluslink.json", setMetaPlusLink); // data for main table
    }
  }, [mode, userJsonDir]);

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
          <Box
            sx={{ flexGrow: 1, fontSize: "0.8em", textAlign: "right" }}
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

        {/* Dialog with General info about this screen */}
        <Dialog fullWidth onClose={() => setOpenInfo(false)} open={openInfo}>
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
            </ul>
          </DialogContent>
        </Dialog>
      </Box>
    </div>
  );
}

export default App;
