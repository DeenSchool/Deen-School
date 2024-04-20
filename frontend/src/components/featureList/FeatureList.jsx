// components/FeatureList.js
import React from "react";
import { Grid, List, ListItem, ListItemText } from "@material-ui/core";
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';

const features = [
  "Arabic Club",
  "Arabic Book Club",
  "Trekking Club",
  "Math Club",
  "Personal Development Club",
  "Sports Club",
  "Monthly Majalis",
  "Ijtima",
  "... much more",
];

const FeatureList = () => {
  return (
    <Grid container spacing={0} style={{paddingBottom: "20px"}}>
      {features.map((feature, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <List>
            <ListItem className="listItems">
              <ArrowRightAltIcon></ArrowRightAltIcon>
              <a href="#" style={{ textDecoration: "none", color: "inherit" }}>
                <ListItemText
                className="listText"
                  primary={feature}
                  style={{ whiteSpace: "nowrap" }}
                />
              </a>
            </ListItem>
          </List>
        </Grid>
      ))}
    </Grid>
  );
};

export default FeatureList;
