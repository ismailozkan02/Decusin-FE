import { useContext } from "react";
import DialogContext from "contexts/DialogContext";

const useDialog = () => {
  const context = useContext(DialogContext);

  if (!context) {
    throw new Error("Dialogs must be inside provider");
  }

  return context;
};

export default useDialog;

// showConfirmation fonksiyon onayı
// showAlert uyarı, error - success
// showToast, sağ üstte süreli mavi bilgi
// openDialog, taşınabilen dialog, içine form componenti koyulabilir
// closeDialog, open dialogu kapatır. içine opendialog id si alır
