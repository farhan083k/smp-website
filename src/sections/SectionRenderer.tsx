import { useSettings } from '../contexts/SettingsContext';
import Announcements from './Announcements';
import Documents from './Documents';
import Programs from './Programs';
import Activities from './Activities';
import Staff from './Staff';
import Projects from './Projects'; // 👈 เพิ่มเข้ามา
import Others from './Others';     // 👈 เพิ่มเข้ามา

export default function SectionRenderer({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { settings } = useSettings();

  // สร้างกลุ่มของ 7 ส่วน และดึงตัวเลขการจัดเรียงจากหน้าตั้งค่ามาใส่
  const sections = [
    { id: 'announcements', order: settings.orderAnnouncements || 1, component: <Announcements isLoggedIn={isLoggedIn} /> },
    { id: 'programs', order: settings.orderPrograms || 2, component: <Programs isLoggedIn={isLoggedIn} /> },
    { id: 'activities', order: settings.orderActivities || 3, component: <Activities isLoggedIn={isLoggedIn} /> },
    { id: 'staff', order: settings.orderStaff || 4, component: <Staff isLoggedIn={isLoggedIn} /> },
    { id: 'documents', order: settings.orderDocuments || 5, component: <Documents isLoggedIn={isLoggedIn} /> },
    { id: 'projects', order: settings.orderProjects || 6, component: <Projects isLoggedIn={isLoggedIn} /> }, // 👈 เพิ่มเข้ามา
    { id: 'others', order: settings.orderOthers || 7, component: <Others isLoggedIn={isLoggedIn} /> },       // 👈 เพิ่มเข้ามา
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