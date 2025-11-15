import React from 'react';
import './Footer.css'; // Импортируем стили, которые мы сохранили

// Заглушка для иконок, так как оригинальные ion-icon требуют дополнительной настройки
const SocialIcon = ({ name, href }: { name: string, href: string }) => (
    <li className="social-icon__item">
        <a className="social-icon__link" href={href} target="_blank" rel="noopener noreferrer">
            {/* В реальном проекте здесь должна быть иконка, например, из react-icons */}
            <i className={`icon-${name}`}></i> 
        </a>
    </li>
);

const Footer: React.FC = () => {
    return (
        <footer className="footer">
            {/* Блок с волнами */}
            <div className="waves">
                {/* ВАЖНО: Для работы волн необходимо, чтобы файл /temp/images/waveFooter.png был доступен 
                    по указанному пути или был заменен на SVG/другое изображение. */}
                <div className="wave" id="wave1"></div>
                <div className="wave" id="wave2"></div>
                <div className="wave" id="wave3"></div>
                <div className="wave" id="wave4"></div>
            </div>

            {/* Социальные иконки */}
            <ul className="social-icon">
                <SocialIcon name="facebook" href="https://www.facebook.com/profile.php?id=61565655472689" />
                <SocialIcon name="tiktok" href="https://www.tiktok.com/@skrepta_kz" />
                <SocialIcon name="twitter" href="https://x.com/skrepta_kz" />
                <SocialIcon name="pinterest" href="https://ru.pinterest.com/Skreptaa/" />
                <SocialIcon name="vk" href="https://vk.com/skrepta_kz" />
                <SocialIcon name="youtube" href="https://www.youtube.com/channel/UCNPaeVPVtsUkLeO7SDXXG3A" />
                <SocialIcon name="instagram" href="https://www.instagram.com/skrepta_kz/" />
            </ul>

            {/* Меню */}
            <ul className="menu">
                {/* Добавленные по запросу элементы */}
                <li className="menu__item"><a className="menu__link" href="/privacy-policy">Политика конфиденциальности</a></li>
                <li className="menu__item"><a className="menu__link" href="/terms-of-use">Условия пользования</a></li>
                <li className="menu__item"><a className="menu__link" href="https://www.instagram.com/skrepta_kz/" target="_blank" rel="noopener noreferrer">Контакты</a></li>
            </ul>

            {/* Копирайт */}
            <p>&copy;{new Date().getFullYear()} Skrepta | All Rights Reserved</p>
        </footer>
    );
};

export default Footer;
