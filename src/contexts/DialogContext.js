import { createContext, useCallback, useRef, useState } from "react";
import { v4 } from "uuid";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useTheme } from "@mui/material/styles";
import DraggableDialog from "components/DraggableDialog";
import useLocale from "hooks/useLocale";

const SweetAlert = withReactContent(Swal);

const Toast = SweetAlert.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 5000,
  timerProgressBar: true,
});

const DialogContext = createContext({});

export const DialogProvider = ({ children }) => {
  const theme = useTheme();
  const { formatMessage } = useLocale();
  const refs = useRef({});
  const [dialogs, setDialogs] = useState([]);

  const openDialog = ({ id, component: Component, content, ...rest }) => {
    if (!id || !id.length) {
      id = v4();
    }

    const Dialog = () =>
      typeof Component === "function" ? (
        <Component ref={(ref) => (refs.current[id] = ref)} {...rest} />
      ) : (
        <DraggableDialog ref={(ref) => (refs.current[id] = ref)} onClose={closeDialog} {...rest} open={true} noHook>
          {content}
        </DraggableDialog>
      );

    setDialogs((state) => {
      if (!state.find(({ id: dialogId }) => dialogId === id)) {
        state = [...state, { id, Dialog }];
      }

      return state;
    });

    return id;
  };

  const closeDialog = (id = null) => {
    setDialogs((state) => {
      if (id && id.length) {
        return state.filter((item) => item.id !== id);
      }

      state.pop();
      return [...state];
    });

    return true;
  };

  const Alert = useCallback(
    SweetAlert.mixin({
      confirmButtonText: formatMessage("button.ok", "OK"),
      denyButtonText: formatMessage("button.no", "No"),
      cancelButtonText: formatMessage("button.cancel", "Cancel"),
    }),
    []
  );

  const showAlert = useCallback((title = "", text = "", options = null, onResult = null) => {
    Alert.fire({
      title,
      text,
      ...options,
    }).then((result) => {
      if (typeof onResult === "function") {
        onResult(result);
      }
    });

    // eslint-disable-next-line
  }, []);

  const showConfirmation = useCallback((title = "", text = "", onConfirm = null, options = null) => {
    Alert.fire({
      title,
      text,
      icon: "question",
      showConfirmButton: true,
      showDenyButton: true,
      focusConfirm: false,
      focusDeny: true,
      confirmButtonText: formatMessage("button.yes", "Yes"),
      denyButtonText: formatMessage("button.no", "No"),
      ...options,
    }).then(({ isConfirmed }) => {
      if (isConfirmed && typeof onConfirm === "function") {
        onConfirm();
      }
    });

    // eslint-disable-next-line
  }, []);

  const showToast = useCallback((type, title = "", text = "", options = null, onResult = null) => {
    Toast.fire({
      title,
      text,
      color: "#fff",
      background: theme.palette[type]?.main || "info",
      ...options,
    }).then((result) => {
      if (typeof onResult === "function") {
        onResult(result);
      }
    });

    // eslint-disable-next-line
  }, []);

  const contextValue = useRef({
    dialogRefs: refs.current,
    openDialog,
    closeDialog,
    showAlert,
    showConfirmation,
    showToast,
  }).current;

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
      {dialogs.map(({ id, Dialog }) => (
        <Dialog key={id} />
      ))}
    </DialogContext.Provider>
  );
};

export default DialogContext;
