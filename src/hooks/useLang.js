import { useContext } from "react";
import LangContext from "contexts/LangContext";

const useLang = () => useContext(LangContext);

export default useLang;
