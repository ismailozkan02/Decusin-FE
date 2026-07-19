import PropTypes from "prop-types";
import { m } from "framer-motion";
import { Box } from "@mui/material";
import { varContainer } from "./variants";

const MotionContainer = ({ animate, action = false, children, ...rest }) => {
  if (true) {
    return (
      <Box
        component={m.div}
        initial={false}
        animate={animate ? "animate" : "exit"}
        variants={varContainer()}
        {...rest}
      >
        {children}
      </Box>
    );
  }

  return (
    <Box
      component={m.div}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={varContainer()}
      {...rest}
    >
      {children}
    </Box>
  );
};

MotionContainer.propTypes = {
  action: PropTypes.bool,
  animate: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

export default MotionContainer;
