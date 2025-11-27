import React from "react";

interface CardProps {
    url?: string;
    alt?: string;
    width?: number;
    height?: number;
    name: string;
    email: string;
    phone: string;
}


export default function Card({url,
    alt,
    width,
    height,
    name,
    email,
    phone
}: CardProps) {
    return (
        <div>
            <div>
                <img src={url} alt={alt} width={width} height={height} />
                <h2>{name}</h2>
            </div>
            <div>
                <p>{email}</p>
                <p>{phone}</p>
            </div>
        </div>
    )
}