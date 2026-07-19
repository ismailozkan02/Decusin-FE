import { useContext } from "react";
import ThemingContext from "contexts/ThemingContext";

const useTheming = () => useContext(ThemingContext);

export default useTheming;
