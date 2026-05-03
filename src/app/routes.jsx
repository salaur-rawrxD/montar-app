import Splash from '../pages/Splash.jsx';
import RigPicker from '../pages/RigPicker.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import ScanLoadSheet from '../pages/ScanLoadSheet.jsx';
import DecodeVehicles from '../pages/DecodeVehicles.jsx';
import LoadPlan from '../pages/LoadPlan.jsx';
import WarningReview from '../pages/WarningReview.jsx';
import YardMapPage from '../pages/YardMapPage.jsx';
import LoadConfirm from '../pages/LoadConfirm.jsx';
import DeliveryPage from '../pages/DeliveryPage.jsx';

export const SCREEN_MAP = {
  splash:      Splash,
  rig:         RigPicker,
  home:        Dashboard,
  scan:        ScanLoadSheet,
  decode:      DecodeVehicles,
  slots:       LoadPlan,
  warning:     WarningReview,
  map:         YardMapPage,
  loadcomplete: LoadConfirm,
  delivery:    DeliveryPage,
};
