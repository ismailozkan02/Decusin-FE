import { Fragment } from "react";
import { useMediaQuery } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";

const MaskImg = styled("img")(() => ({
  bottom: 0,
  zIndex: -1,
  width: "100%",
  position: "absolute",
}));

const Tree1Img = styled("img")(() => ({
  left: 0,
  bottom: 0,
  position: "absolute",
}));

const Tree2Img = styled("img")(() => ({
  right: 0,
  bottom: 0,
  position: "absolute",
}));

const Footer = ({ image1, image2 }) => {
  const theme = useTheme();
  const hidden = useMediaQuery(theme.breakpoints.down("md"));

  if (hidden) return null;

  return (
    <Fragment>
      {image1 || (
        <Tree1Img
          src={`${process.env.PUBLIC_URL}/favs/auth-v1-tree.png`}
          alt={""}
        />
      )}
      <MaskImg
        src={`${process.env.PUBLIC_URL}/images/illustrations/auth-v1-mask-${theme.palette.mode}.png`}
      />
      {image2 || (
        <Tree2Img
          src={`${process.env.PUBLIC_URL}/favs/auth-v1-tree-2.png`}
          alt={""}
        />
      )}
    </Fragment>
  );
};

export default Footer;
