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

  function firestoreTimestampToDateString(firestoreTimestamp) {
    const { seconds, nanoseconds } = firestoreTimestamp;
    const milliseconds = seconds * 1000 + nanoseconds / 1000000;
    const date = new Date(milliseconds);
    return date.toString();
  }

  // ==================================================================================

  const editState = async ({ added, changed, deleted }) => {
    if (added) {
      if (changed === undefined) {
        const id = Date.now().toString();
        await setDoc(doc(db, "scheduler", id), { id, ...added });
        dataUpdate();
      } else {
        // clean reps
        const [deleteId = id] = Object.keys(changed);
        await deleteDoc(doc(db, "scheduler", deleteId));
        const id = Date.now().toString();
        const { rRule, ...addedWithoutRRule } = added;
        await setDoc(doc(db, "scheduler", id), { id, ...addedWithoutRRule });
        dataUpdate();
      }
    }

    if (changed && added === undefined) {
      const [id] = Object.keys(changed);
      await updateDoc(doc(db, "scheduler", id), changed[id]);
      dataUpdate();
    }

    if (deleted !== undefined) {
      await deleteDoc(doc(db, "scheduler", deleted));
      dataUpdate();
    }
  };

  // ==================================================================================

  const dataUpdate = async () => {
    const data = await getDocs(collection(db, "scheduler"));
    const newArr = [];
    data.forEach((doc) => {
      const firestoreObj = doc.data();
      const startDate = firestoreTimestampToDateString(firestoreObj.startDate);
      const endDate = firestoreTimestampToDateString(firestoreObj.endDate);
      newArr.push({ ...firestoreObj, startDate, endDate });
    });
    setData(newArr);
  };

  useEffect(() => {
    dataUpdate();
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
