// nav yapısı buradan çekiliyor

import { DASHBOARD } from "routes/paths";
import StateMachine from "mdi-material-ui/StateMachine";
import HomeOutline from "mdi-material-ui/HomeOutline";
import StoreSearchOutline from "mdi-material-ui/StoreSearchOutline";
import NoteOutlinedIcon from "@mui/icons-material/NoteOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import BellCogOutline from "mdi-material-ui/BellCogOutline";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import SourceOutlinedIcon from "@mui/icons-material/SourceOutlined";
import PrivacyTipOutlinedIcon from "@mui/icons-material/PrivacyTipOutlined";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import DescriptionIcon from "@mui/icons-material/Description";
import LanguageIcon from "@mui/icons-material/Language";
import ApartmentIcon from "@mui/icons-material/Apartment";
import SchoolIcon from "@mui/icons-material/School";
import ViewInArOutlinedIcon from "@mui/icons-material/ViewInArOutlined";
import KitchenOutlinedIcon from "@mui/icons-material/KitchenOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";

const nav = (me, formatMessage) => [
  {
    title: formatMessage("nav.overview", "Overview"),
    icon: HomeOutline,
    path: DASHBOARD.overview,
  },
  {
    type: "section",
    icon: ViewInArOutlinedIcon,
    title: formatMessage("nav.kitchenStudio", "Mutfak Tasarım"),
    children: [
      {
        title: formatMessage("nav.kitchenDesigner", "Tasarım Sahnesi"),
        icon: ViewInArOutlinedIcon,
        path: DASHBOARD.kitchenDesigner,
      },
      {
        title: formatMessage("nav.kitchenCatalog", "Ürünler & Malzemeler"),
        icon: KitchenOutlinedIcon,
        path: DASHBOARD.kitchenCatalog,
      },
      {
        title: "Müşteriler",
        icon: PersonAddAltOutlinedIcon,
        path: DASHBOARD.kitchenCustomers,
        public: true,
      },
      {
        title: formatMessage("nav.kitchenProjects", "Projeler"),
        icon: NoteOutlinedIcon,
        path: DASHBOARD.kitchenProjects,
      },
    ],
  },
];

export default nav;
