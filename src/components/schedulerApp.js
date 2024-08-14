import * as React from "react";
import { useState, useEffect } from "react";
import Paper from "@mui/material/Paper";

import {
  ViewState,
  EditingState,
  IntegratedEditing,
} from "@devexpress/dx-react-scheduler";
import {
  Scheduler,
  DayView,
  WeekView,
  MonthView,
  Toolbar,
  DateNavigator,
  Appointments,
  AppointmentTooltip,
  AppointmentForm,
  TodayButton,
  ViewSwitcher,
} from "@devexpress/dx-react-scheduler-material-ui";

import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { appointmentFormPL } from "./translation";

export default function SchedulerApp() {
  const [data, setData] = useState([]);

  const firestoreTimestampToDate = (firestoreTimestamp) => {
    const { seconds, nanoseconds } = firestoreTimestamp;
    const milliseconds = seconds * 1000 + nanoseconds / 1000000;
    const date = new Date(milliseconds);
    return date;
  };

  // ==================================================================================

  const create = async (added) => {
    const id = Date.now().toString();
    const title = added.title ? added.title : "";
    const rRule = added.rRule ? added.rRule : "";
    await setDoc(doc(db, "scheduler", id), { id, ...added, title, rRule });
    schedulerUpdate();
  };

  const update = async (changed) => {
    const [id] = Object.keys(changed);

    const rRule = changed[id].rRule ? changed[id].rRule : "";
    await updateDoc(doc(db, "scheduler", id), { ...changed[id], rRule });

    schedulerUpdate();
  };

  const deleteNote = async (id) => {
    await deleteDoc(doc(db, "scheduler", id));
    schedulerUpdate();
  };

  const replace = async (added, changed) => {
    const [id] = Object.keys(changed);
    await deleteNote(id);
    await create(added);
  };

  const editState = async ({ added, changed, deleted }) => {
    console.log(added, changed, deleted);
    console.log("====================================");
    if (added && changed === undefined) {
      create(added);
    }

    if (changed) {
      added ? replace(added, changed) : update(changed);
    }

    if (deleted !== undefined) {
      deleteNote(deleted);
    }
  };

  // ==================================================================================

  const schedulerUpdate = async () => {
    const data = await getDocs(collection(db, "scheduler"));
    const newArr = [];
    data.forEach((doc) => {
      const firestoreObj = doc.data();
      const startDate = firestoreTimestampToDate(firestoreObj.startDate);
      const endDate = firestoreTimestampToDate(firestoreObj.endDate);
      newArr.push({ ...firestoreObj, startDate, endDate });
    });
    setData(newArr);
  };

  useEffect(() => {
    schedulerUpdate();
  }, []);

  return (
    <Paper>
      <Scheduler locale={"pl-PL"} data={data}>
        <ViewState />
        <EditingState onCommitChanges={editState} />
        <IntegratedEditing />

        <DayView name={"Dzień"} cellDuration={60} />
        <WeekView name={"Tydzień"} cellDuration={60} />
        <MonthView name={"Miesiąc"} />

        <Toolbar />
        <ViewSwitcher />
        <DateNavigator />
        <TodayButton
          messages={{
            today: "Dzisiaj",
          }}
        />

        <Appointments />
        <AppointmentTooltip showCloseButton showOpenButton />
        <AppointmentForm messages={appointmentFormPL} />
      </Scheduler>
    </Paper>
  );
}
