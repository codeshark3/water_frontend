

export default function TestLayout({children,}:Readonly<{children:React.ReactNode}>){
    return(
        <>
        <header
        className="flex h-16 shrink-0 items-center gap-2 border-b px-4"
        ></header>
        <div className="flex flex-1 flex-col gap-4 p-4">
            {children}
        </div></>
    )
}