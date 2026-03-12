import { useSettings } from '../contexts/SettingsContext';
import Announcements from './Announcements';
import Documents from './Documents';
import Programs from './Programs';
import Activities from './Activities';
import Staff from './Staff';

export default function SectionRenderer({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { settings } = useSettings();

  // สร้างกลุ่มของส่วนต่างๆ และดึงตัวเลขการจัดเรียงจากหน้าตั้งค่ามาใส่
  const sections = [
    { id: 'announcements', order: settings.orderAnnouncements || 1, component: <Announcements isLoggedIn={isLoggedIn} /> },
    { id: 'documents', order: settings.orderDocuments || 2, component: <Documents isLoggedIn={isLoggedIn} /> },
    { id: 'programs', order: settings.orderPrograms || 3, component: <Programs isLoggedIn={isLoggedIn} /> },
    { id: 'activities', order: settings.orderActivities || 4, component: <Activities isLoggedIn={isLoggedIn} /> },
    { id: 'staff', order: settings.orderStaff || 5, component: <Staff isLoggedIn={isLoggedIn} /> },
  ];

  // เรียงลำดับจากตัวเลขน้อยไปมาก
  sections.sort((a, b) => a.order - b.order);

  // นำมาแสดงผลตามลำดับที่เรียงแล้ว
  return (
    <div className="flex flex-col">
      {sections.map(sec => (
        <div key={sec.id}>{sec.component}</div>
      ))}
    </div>
  );
}