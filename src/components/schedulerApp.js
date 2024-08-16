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
  DragDropProvider,
} from "@devexpress/dx-react-scheduler-material-ui";

import { appointmentFormPL } from "./translation";
import useFirestore from "./useFirestore";

export default function SchedulerApp() {
  const [data, setData] = useState([]);

  const { schedulerUpdate, create, update, deleteNote, replace } =
    useFirestore(setData);

  const editState = async ({ added, changed, deleted }) => {
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
        <DragDropProvider />
      </Scheduler>
    </Paper>
  );
}
