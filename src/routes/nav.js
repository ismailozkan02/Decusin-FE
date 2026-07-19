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
        title: formatMessage("nav.kitchenCustomers", "Müşteriler"),
        icon: PersonAddAltOutlinedIcon,
        path: DASHBOARD.kitchenCustomers,
      },
      {
        title: formatMessage("nav.kitchenProjects", "Projeler"),
        icon: NoteOutlinedIcon,
        path: DASHBOARD.kitchenProjects,
      },
    ],
  },
  {
    title: formatMessage("myProfile", "My Profile"),
    icon: AccountBoxIcon,
    path: "/profile",
  },
  {
    title: formatMessage("myDocuments", "My Documents"),
    icon: DescriptionIcon,
    path: "/mydocument",
  },
  {
    title: formatMessage("myDocument", "University"),
    icon: SchoolIcon,
    path: "/university",
  },
  {
    title: formatMessage("accomodation", "Accomodation"),
    icon: ApartmentIcon,
    path: "/accomodation",
  },
  {
    title: formatMessage("languageCourse", "Language Course"),
    icon: LanguageIcon,
    path: "/language-course",
  },

  // {
  //   type: "section",
  //   icon: StateMachine,
  //   title: formatMessage("nav.myAccount", "My Account"),
  //   children: [
  //     {
  //       title: formatMessage("nav.Myprofile", "My Profile"),
  //       icon: PortraitOutlinedIcon,
  //       path: "/profile",
  //     },
  //     {
  //       title: formatMessage("nav.MyExpert", "My Expert"),
  //       icon: AccountTie,
  //       path: "/myExpert",
  //     },
  //     {
  //       title: formatMessage("myReports", "My Reports"),
  //       icon: ContentPasteSearchOutlinedIcon,
  //       path: "/myReports",
  //     },
  //     {
  //       title: formatMessage("nav.Myappointment", "My Appointment"),
  //       icon: CalendarMonthIcon,
  //       path: "/appointment",
  //     },
  //     {
  //       title: formatMessage("nav.Modules", "Modules"),
  //       icon: AddReactionOutlinedIcon,
  //       path: "/module",
  //     },
  //   ],
  // },

  // {
  //   type: "section",
  //   icon: StateMachine,
  //   title: formatMessage("nav.Finance", "Finance"),
  //   children: [
  //     {
  //       title: formatMessage("nav.Payments", "Payments"),
  //       icon: Finance,
  //       path: "/payments",
  //     },
  //     {
  //       title: formatMessage("nav.Expences", "Expences"),
  //       icon: BankTransferOut,
  //       path: "/expences",
  //     },
  //   ],
  // },

  // {
  //   type: "section",
  //   icon: StateMachine,
  //   title: formatMessage("Organization", "Organization"),
  //   children: [
  //     {
  //       title: formatMessage("myOrganization", "My Organization"),
  //       icon: BusinessIcon,
  //       path: "/myOrganization",
  //     },
  //   ],
  // },

  {
    type: "section",
    icon: StateMachine,
    title: formatMessage("nav.system", "System"),
    children: [
      {
        title: formatMessage("nav.users", "Users"),
        icon: PeopleAltOutlinedIcon,
        path: "/users",
      },
      {
        title: formatMessage("nav.EmailNotifications", "Email Notifications"),
        icon: BellCogOutline,
        path: "/emailNotifications",
      },

      {
        title: formatMessage("nav.Permisions", "Permisions"),
        icon: GroupsOutlinedIcon,
        path: "/",
        children: [
          {
            title: formatMessage("nav.Groups", "Groups"),
            path: "/groups",
          },
          {
            title: formatMessage("nav.Pages", "Pages"),
            path: "/pages",
          },
        ],
      },
      {
        title: formatMessage("support", "Support"),
        icon: PrivacyTipOutlinedIcon,
        path: "/support",
      },
      {
        title: formatMessage("nav.lookups", "Lookups"),
        icon: StoreSearchOutline,
        path: DASHBOARD.lookup.root,
        children: [
          {
            title: formatMessage("nav.EmailTemplate", "Email Template"),
            path: DASHBOARD.lookup.list("email"),
          },
          {
            title: formatMessage("nav.Country", "Country"),
            path: DASHBOARD.lookup.list("country"),
          },
          {
            title: formatMessage("nav.PrivacyPolicy", "Privacy Policy"),
            path: DASHBOARD.lookup.list("PrivacyPolicy"),
          },
          {
            title: formatMessage("nav.Nationality", "Nationality"),
            path: DASHBOARD.lookup.list("nationality"),
          },
          {
            title: formatMessage("nav.Language", "Language"),
            path: DASHBOARD.lookup.list("language"),
          },
        ],
      },

      {
        title: formatMessage("Development", "Development"),
        icon: SourceOutlinedIcon,
        path: DASHBOARD.lookup.root,
        children: [
          {
            title: formatMessage("nav.Logs", "Logs"),
            path: "/development/logs",
          },
        ],
      },
    ],
  },
];

export default nav;
