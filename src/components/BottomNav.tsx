'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import styles from './BottomNav.module.css';

const navItems = [
    { href: '/', label: 'Home', icon: '⌂', activeIcon: '⌂' },
    { href: '/chat', label: 'Chat', icon: '💬', activeIcon: '💬' },
    { href: '/shopping', label: 'Shop', icon: '🛒', activeIcon: '🛒' },
    { href: '/personal', label: 'My Tasks', icon: '👤', activeIcon: '👤' },
    { href: '/feedback', label: 'Feedback', icon: '📝', activeIcon: '📝' },
    { href: '/settings', label: 'Settings', icon: '⚙', activeIcon: '⚙' },
];

export default function BottomNav() {
    const pathname = usePathname();
    const { user } = useAuth();

    if (!user || pathname === '/login' || pathname === '/join') return null;

    return (
        <nav className={styles.nav}>
            <div className={styles.inner}>
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.item} ${isActive ? styles.active : ''}`}
                        >
                            <span className={styles.icon}>
                                {isActive ? item.activeIcon : item.icon}
                            </span>
                            <span className={styles.label}>{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
