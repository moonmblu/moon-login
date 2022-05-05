import { h, Fragment } from 'preact'

export function Loader() {
    return <>
        <h1 id='loading-header'>MarxAtHome</h1>
        <div class='loading-bar'>
            <div class='loading-bar-ball ball-1' />
            <div class='loading-bar-ball ball-2' />
            <div class='loading-bar-ball ball-3' />
            <div class='loading-bar-ball ball-4' />
            <div class='loading-bar-ball ball-5' />
        </div>
    </>
}