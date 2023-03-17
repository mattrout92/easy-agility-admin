import React, { useEffect, useState } from "react";
import "./App.css";
import {
  Box,
  Button,
  CssBaseline,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";

const modalStyle = {
  minWidth: "350px",
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "white",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export type Entry = {
  id: number;
  queued_at?: string;
  partnership?: string;
  time?: number;
  nfc_run?: boolean;
  eliminated?: boolean;
  total_faults?: number;
  run_data?: string[];
};

type Show = {
  name: string;
  date: Date;
  venue: string;
  classes: C[];
};

type C = {
  id: number;
  name: string;
  height_grades: any;
};

const showID = 5;

function App() {
  const [faults, setFaults] = useState<string[]>([]);
  const [eliminated, setEliminated] = useState<boolean>(false);
  const [nfcRun, setNFCRun] = useState<boolean>(false);
  const [time, setTime] = useState<string>("0");
  const [queue, setQueue] = useState<boolean>(false);
  const [scrime, setScrime] = useState<boolean>(false);
  const [classValue, setClassValue] = useState<number>(0);
  const [height, setHeight] = useState<string>("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [queueConfirmOpen, setQueueConfirmOpen] = useState<boolean>(false);
  const [submitResultOpen, setSubmitResultOpen] = useState<boolean>(false);

  const [queuedEntry, setQueuedEntry] = useState<Entry>({} as Entry);
  const [nextEntry, setNextEntry] = useState<Entry>({} as Entry);
  const [show, setShow] = useState<Show>({} as Show);
  const [heights, setHeights] = useState<string[]>([]);

  useEffect(() => {
    getEntries();
    // eslint-disable-next-line
  }, [height, classValue]);

  useEffect(() => {
    getShow();
    getNextEntry();
  }, []);

  const getShow = async () => {
    const response = await axios.get(
      `https://api.easyagility.co.uk/shows/${showID}`
    );

    setShow(response.data);
    setClassValue(response.data?.classes[0].id);
    if (response.data?.classes[0].height_grades) {
      const heightGrades = response.data?.classes[0].height_grades as any;
      const heights = Object.keys(heightGrades);
      setHeights(heights);
      setHeight(heights[0]);
    }
  };

  const getNextEntry = async () => {
    const response = await axios.get(
      `https://api.easyagility.co.uk/shows/${showID}/entries/next`
    );

    setNextEntry(response.data);
  };

  const getEntries = async () => {
    const response = await axios.get(
      `https://api.easyagility.co.uk/shows/${showID}/classes/${classValue}/entries?height=${encodeURIComponent(
        height
      )}`
    );

    setEntries(response.data);
  };

  const queueEntry = async (entryId: number) => {
    await axios.post(`https://api.easyagility.co.uk/entries/${entryId}/queue`);
    await getEntries();
  };

  const unqueueEntry = async (entryId: number) => {
    await axios.post(
      `https://api.easyagility.co.uk/entries/${entryId}/unqueue`
    );
    await getEntries();
  };

  const submitResult = async (entryId: number) => {
    await axios.post(
      `https://api.easyagility.co.uk/entries/${entryId}/unqueue`
    );

    await axios.post(
      `https://api.easyagility.co.uk/entries/${entryId}/results`,
      {
        id: entryId,
        partnership: nextEntry.partnership,
        time: parseFloat(time),
        nfc_run: nfcRun,
        eliminated: eliminated,
        total_faults: faults.length * 5,
        run_data: faults,
      }
    );

    setTime("0");
    setEliminated(false);
    setNFCRun(false);
    setFaults([]);

    await getNextEntry();

    setSubmitResultOpen(false);
  };

  const columns = [
    {
      field: "partnership",
      headerName: "Entry",
      width: "150",
      renderCell: (params: any) => {
        return (
          <Box
            sx={{
              maxHeight: "inherit",
              width: "100%",
              whiteSpace: "initial",
              lineHeight: "16px",
            }}
          >
            {params.value}
          </Box>
        );
      },
    },
    {
      type: "actions",
      width: 120,
      getActions: (params: any) => {
        return [
          <Button
            fullWidth
            variant="outlined"
            color={params.row.queued_at ? "primary" : "success"}
            onClick={() => {
              setQueuedEntry(params.row);
              setQueueConfirmOpen(true);
            }}
          >
            {params.row.queued_at ? "Unqueue" : "Queue"}
          </Button>,
        ];
      },
    },
    {
      field: "time",
      headerName: "Run?",
      type: "boolean",
      valueGetter: ({ value, row }: any) =>
        value ? true : row?.eliminated ? true : row?.nfc_run ? true : false,
    },
  ];

  return (
    <Box sx={{ display: "flex", textAlign: "center" }}>
      <CssBaseline />

      {scrime ? (
        <Grid padding={2} container rowSpacing={3}>
          <Grid item xs={12}>
            <Button
              onClick={() => {
                getNextEntry();
                setScrime(false);
                setQueue(true);
              }}
              fullWidth
              color="secondary"
              variant="contained"
            >
              Go To Queue
            </Button>
          </Grid>
          {nextEntry.id && nextEntry.id !== 0 ? (
            <>
              <Grid item xs={12}>
                <Typography variant="h6">{nextEntry.partnership}</Typography>
              </Grid>

              {eliminated && (
                <Grid item xs={12}>
                  <Typography variant="h6">Eliminated</Typography>
                </Grid>
              )}
              {nfcRun && (
                <Grid item xs={12}>
                  <Typography variant="h6">NFC</Typography>
                </Grid>
              )}

              <Grid item xs={12}>
                <Typography variant="h6">
                  Faults: {faults.length === 0 ? "None" : faults.join(", ")}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  variant="outlined"
                  type="number"
                  label="Competitor Time"
                  value={time}
                  onChange={(e) => {
                    try {
                      setTime(e.target.value);
                    } catch (e) {}
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  onClick={() => {
                    setFaults([...faults, "R"]);
                  }}
                  fullWidth
                  variant="contained"
                >
                  Refusal
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  onClick={() => {
                    setFaults([...faults, "5"]);
                  }}
                  fullWidth
                  variant="contained"
                >
                  5
                </Button>
              </Grid>
              <Grid
                onClick={() => {
                  setEliminated(!eliminated);
                }}
                item
                xs={12}
              >
                <Button fullWidth variant="contained">
                  {eliminated ? "Undo Elimination" : "Elimination"}
                </Button>
              </Grid>
              <Grid
                onClick={() => {
                  setNFCRun(!nfcRun);
                }}
                item
                xs={12}
              >
                <Button fullWidth variant="contained">
                  {nfcRun ? "Undo NFC" : "NFC"}
                </Button>
              </Grid>
              <Grid
                onClick={() => {
                  const f = [...faults];
                  f.pop();
                  setFaults(f);
                }}
                item
                xs={12}
              >
                <Button fullWidth variant="contained">
                  Undo Last Fault
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  disabled={!nfcRun && !eliminated && parseFloat(time) === 0}
                  fullWidth
                  color="success"
                  variant="contained"
                  onClick={() => setSubmitResultOpen(true)}
                >
                  Submit
                </Button>
              </Grid>
              <Modal
                open={submitResultOpen}
                onClose={() => setSubmitResultOpen(false)}
              >
                <Box sx={modalStyle}>
                  <Typography
                    id="modal-modal-title"
                    variant="h6"
                    component="h2"
                  >
                    Submit This Result
                  </Typography>
                  <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                    Are you sure you want to submit this result
                  </Typography>

                  <Button
                    onClick={() => {
                      setSubmitResultOpen(false);
                    }}
                    style={{ minWidth: "100%", marginTop: "30px" }}
                    variant="contained"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      submitResult(nextEntry.id);
                    }}
                    style={{ minWidth: "100%", marginTop: "30px" }}
                    variant="contained"
                  >
                    Confirm
                  </Button>
                </Box>
              </Modal>
            </>
          ) : (
            <>
              <Grid item xs={12}>
                <Typography variant="h6">
                  There are currently no entries queued to run.
                </Typography>
                <Button
                  color="success"
                  onClick={() => {
                    getNextEntry();
                  }}
                  style={{ minWidth: "100%", marginTop: "30px" }}
                  variant="contained"
                >
                  Refresh
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      ) : queue ? (
        <>
          <Grid padding={2} container rowSpacing={3}>
            <Grid item xs={12}>
              <Button
                onClick={() => {
                  getNextEntry();
                  setQueue(false);
                  setScrime(true);
                }}
                fullWidth
                color="secondary"
                variant="contained"
              >
                Go To Scrime
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">Queue</Typography>
            </Grid>

            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel id={`class-select-label`}>
                  Select A Class
                </InputLabel>
                <Select
                  labelId={`class-select-label`}
                  id={`class-select`}
                  label="Select A Class"
                  name="select_class"
                  value={classValue}
                  onChange={(e) => {
                    setClassValue(e.target.value as any);
                    const heightGrades = show.classes.find(
                      (c) => c.id === e.target.value
                    )?.height_grades;

                    const heights = Object.keys(heightGrades);
                    setHeights(heights);
                    setHeight(heights[0]);
                  }}
                  fullWidth
                >
                  {show?.classes?.map((c: C, index: number) => (
                    <MenuItem key={index} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel id={`height-select-label`}>
                  Select A Height
                </InputLabel>
                <Select
                  labelId={`height-select-label`}
                  id={`height-select`}
                  label="Select A Height"
                  name="select_height"
                  fullWidth
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                >
                  {heights.map((height, index) => (
                    <MenuItem key={index} value={height}>
                      {height}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <DataGrid
                {...({
                  columns: columns,
                  rows: entries || [],
                } as any)}
                autoHeight
              />
            </Grid>

            <Modal
              open={queueConfirmOpen}
              onClose={() => setQueueConfirmOpen(false)}
            >
              <Box sx={modalStyle}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                  {queuedEntry.queued_at ? "Unqueue" : "Queue"} This Entry
                </Typography>
                <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                  Are you sure you want to
                  {queuedEntry.queued_at ? " unqueue" : " queue"}{" "}
                  {queuedEntry.partnership}
                </Typography>

                <Button
                  onClick={() => {
                    setQueuedEntry({} as Entry);
                    setQueueConfirmOpen(false);
                  }}
                  style={{ minWidth: "100%", marginTop: "30px" }}
                  variant="contained"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    queuedEntry.queued_at
                      ? unqueueEntry(queuedEntry.id)
                      : queueEntry(queuedEntry.id);
                    setQueuedEntry({} as Entry);
                    setQueueConfirmOpen(false);
                  }}
                  style={{ minWidth: "100%", marginTop: "30px" }}
                  variant="contained"
                >
                  Confirm
                </Button>
              </Box>
            </Modal>
          </Grid>
        </>
      ) : (
        <Grid padding={2} container rowSpacing={3}>
          <Grid item xs={12}>
            <Button
              onClick={() => setScrime(true)}
              fullWidth
              color="success"
              variant="contained"
            >
              Scrime
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Button
              onClick={() => setQueue(true)}
              fullWidth
              color="success"
              variant="contained"
            >
              Queue
            </Button>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default App;
