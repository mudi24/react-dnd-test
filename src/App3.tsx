import {  Fragment, useCallback, useContext, useEffect, useState } from "react";
import './App3.css';
import { useDrag, useDrop } from "react-dnd";
import React from "react";

const ROW = 'row';
const COLUMN = 'column';
const COMPONENT = 'component';

interface LayoutItem {
    type: string;
    id: string;
    children?: LayoutItem[];
    component?: {
        type: string;
    }
}
const initialLayout = [
    {
        type: ROW,
        id: "row0",
        children: [
            {
                type: COLUMN,
                id: "column0",
                children: [
                    {
                        type: COMPONENT,
                        id: "component0",
                        component: {
                            type: 'aaa'
                        }
                    },
                    {
                        type: COMPONENT,
                        id: "component1",
                        component: {
                            type: 'bbb'
                        }
                    }
                ]
            },
            {
                type: COLUMN,
                id: "column1",
                children: [
                    {
                        type: COMPONENT,
                        id: "component2",
                        component: {
                            type: 'aaa'
                        }
                    }
                ]
            }
        ]
    },
    {
        type: ROW,
        id: "row1",
        children: [
            {
                type: COLUMN,
                id: "column2",
                children: [
                    {
                        type: COMPONENT,
                        id: "component3",
                        component: {
                            type: 'bbb'
                        }
                    },
                    {
                        type: COMPONENT,
                        id: "component0",
                        component: {
                            type: 'aaa'
                        }
                    },
                    {
                        type: COMPONENT,
                        id: "component2",
                        component: {
                            type: 'bbb'
                        }
                    }
                ]
            }
        ]
    }
];

function Aaa() {
    return <button>aaa</button>
}
function Bbb() {
    return <img alt="哆啦A梦" width="50" height="50" src="https://img0.baidu.com/it/u=3610760552,2286123102&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500"/>
}

function Ccc() {
    return <input type="range"></input>
}

const registeredComponent: Record<string, any> = {
    aaa: Aaa,
    bbb: Bbb,
    ccc: Ccc
}

interface DropZoneProps {
    className: string;
    path: string
}
function DropZone(props: DropZoneProps) {
    const { swapPosition } = useContext(LayoutContext)
    const [{ overing }, drop] = useDrop({
        accept: ['column', 'row', 'component', 'barItem'],
        drop(item: any) {
            console.log(item);
            console.log(props);
            
            
            swapPosition(item, props.path)
        },
        collect(monitor) {
            return {
                overing: monitor.isOver()
            }
        }
    });
    return <div ref={drop} className={`drop-zone ${props.className} ${overing ? 'focus' : ''}`}></div>
}


interface ComponentProps {
    data: LayoutItem,
    rowIndex: number;
    columnIndex: number,
    compIndex: number
}
function Component(compProps: ComponentProps) {
    const { component } = compProps.data;
    const currentPath = `${compProps.rowIndex}-${compProps.columnIndex}-${compProps.compIndex}`
    const [,drag] = useDrag({
        type: 'component',
        item: {
            type: 'component',
            data: compProps.data,
            path: currentPath
        }
    })
    const Comp = registeredComponent[component!.type]

    return <div ref={drag} className="component">
        {
            <Comp></Comp>
        }
    </div>
}

interface ColumnProps {
    data: LayoutItem;
    rowIndex: number;
    columnIndex: number
}

function Column(columnProps: ColumnProps) {
    const { children } = columnProps.data;
    const currentPath = `${columnProps.rowIndex}-${columnProps.columnIndex}`
    const [,drag] = useDrag({
        type: 'column',
        item: {
            type: 'column',
            path: currentPath,
            data: columnProps.data,
        }
    })
    return <div ref={drag} className="column">
        {
            children?.map((item, index) => {
                return <Fragment>
                     <DropZone className="drop-zone-horizental" path={`${currentPath}-${index}`}></DropZone>
                    <Component key={`comp_id_${item.id}`} data={item} rowIndex={columnProps.rowIndex} columnIndex={columnProps.columnIndex} compIndex={index}></Component>
                </Fragment>
            })
        }
         <DropZone className="drop-zone-horizental" path={`${currentPath}-${children?.length}`}></DropZone>
    </div>
}

interface RowProps {
    data: LayoutItem,
    rowIndex: number
}
function Row(rowProps: RowProps) {
    const { children } = rowProps.data;
    const currentPath = rowProps.rowIndex + '';
    const [,drag] = useDrag({
        type: 'row',
        item: {
            path: currentPath,
            type: 'row',
            data: rowProps.data,
        }
    })
    return <div ref={drag} className="row">
        {
            children?.map((item, index) => {
                return <Fragment>
                     <DropZone className="drop-zone-vertical" path={`${currentPath}-${index}`}></DropZone>
                    <Column key={`col_id_${item.id}`} data={item} rowIndex={rowProps.rowIndex} columnIndex={index}></Column>
                </Fragment>
            })
        }
         <DropZone className="drop-zone-vertical"  path={`${currentPath}-${children?.length}`}></DropZone>
    </div>
}

interface BarItemProps {
    type: string;
}
function BarItem(props: BarItemProps) {
    const Comp = registeredComponent[props.type];
    const [,drag] = useDrag({
        type: 'barItem',
        item: props
    })
    return <div ref={drag} className="bar-item">
        <Comp></Comp>
    </div>
}

type ContextType = {swapPosition: Function };
const LayoutContext = React.createContext<ContextType>({
    swapPosition: () => {}
})
function App() {
    const [layout, setLayout] = useState<LayoutItem[]>(initialLayout);

    const swapPosition = useCallback((item: any, path2: string) =>{
        // console.log(item.path, path2);
        // 从 1-0-0 拖拽到 0-1-1 的情况：
        // const lay = layout as any;

        // lay[1].children[0].children.splice(0, 1);
        // lay[0].children[1].children.splice(1, 0, item.data);

        // setLayout([...lay])



        // 从 0-0-1 到 0-1 
        // const lay = layout as any;

        // lay[0].children[0].children.splice(1, 1);
        // lay[0].children.splice(1, 0, {
        //         type: COLUMN,
        //         children: [
        //             item.data
        //         ]
        //     }
        // );
        // setLayout([...lay])


        
        // 从 bottomBar 拖到 1-0-2 
        const lay = layout as any;

        lay[1].children[0].children.splice(2, 0, {
                type: COMPONENT,
                component: {
                    type: item.type
                }
            }
        );
        setLayout([...lay])

    },[])
    return <LayoutContext.Provider value={{swapPosition}}>
         <div className="container">
            {
                layout.map((item, index) => {
                    return <Fragment>
                        <DropZone className="drop-zone-horizental"  path={`${index}`}></DropZone>
                        <Row key={`row_id_${item.id}`} data={item} rowIndex={index}></Row>;
                    </Fragment>
                })
            }
            <DropZone className="drop-zone-horizental"  path={`${layout.length}`}></DropZone>
            <div className="bottomBar">
                <BarItem type="aaa"></BarItem>
                <BarItem type="bbb"></BarItem>
                <BarItem type="ccc"></BarItem>
            </div>
        </div>
    </LayoutContext.Provider>
}
export default App;
