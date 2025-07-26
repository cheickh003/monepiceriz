import { ImgHTMLAttributes } from 'react';

export default function ApplicationLogo(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            {...props}
            src="/logo-monepiceriz.png"
            alt="Monepiceriz"
        />
    );
}
