import classes from "./MainContent.module.css";
import { Fragment } from "react";
import { Outlet } from "react-router-dom";

const MainContent = () => {
  return (
    <Fragment>
        <div className={classes.mainContent}>
            <Outlet />
        </div>
    </Fragment>
  );
};

export default MainContent;
