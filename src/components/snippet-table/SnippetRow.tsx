import {alpha, Skeleton, styled, TableRow, TableRowProps} from "@mui/material";
import {StyledTableCell} from "./SnippetTable.tsx";
import {Snippet} from "../../utils/snippet.ts";

const PINK_BORDER_COLOR = '#ad1457';
const PINK_HOVER_BG = '#f8bbd0';

const StyledTableRow = styled(TableRow)(({theme}) => ({
    backgroundColor: 'white',
    border: 0,
    height: '75px',
    cursor: 'pointer',
    '& td': {
        borderTop: '2px solid transparent',
        borderBottom: '2px solid transparent',
    },
    '& td:first-of-type': {
        borderLeft: '2px solid transparent',
        borderTopLeftRadius: theme.shape.borderRadius,
        borderBottomLeftRadius: theme.shape.borderRadius,
    },
    '& td:last-of-type': {
        borderRight: '2px solid transparent',
        borderTopRightRadius: theme.shape.borderRadius,
        borderBottomRightRadius: theme.shape.borderRadius,
    },
    '&:hover > td': {
        backgroundColor: alpha(PINK_HOVER_BG, 0.4),

        borderTop: `2px ${PINK_BORDER_COLOR} solid`,
        borderBottom: `2px ${PINK_BORDER_COLOR} solid`,
    },
    '&:hover > td:first-of-type': {
        borderLeft: `2px ${PINK_BORDER_COLOR} solid`,
    },
    '&:hover > td:last-of-type': {
        borderRight: `2px ${PINK_BORDER_COLOR} solid`
    },
}));


export const SnippetRow = ({snippet, onClick, ...props}: { snippet: Snippet, onClick: () => void } & TableRowProps) => {
    return (
        <StyledTableRow onClick={onClick} sx={{backgroundColor: 'white', border: 0, height: '75px'}} {...props}>
            <StyledTableCell>{snippet.name}</StyledTableCell>
            <StyledTableCell>{snippet.language}</StyledTableCell>
            <StyledTableCell>{snippet.version}</StyledTableCell>
            <StyledTableCell>{snippet.ownerEmail}</StyledTableCell>
            <StyledTableCell>{snippet.compliance}</StyledTableCell>
        </StyledTableRow>
    )
}

export const LoadingSnippetRow = () => {
    return (
        <TableRow sx={{height: '75px', padding: 0}}>
            <StyledTableCell colSpan={4} sx={{
                padding: 0
            }}>
                <Skeleton height={"75px"} width={"100%"} variant={"rectangular"}/>
            </StyledTableCell>
        </TableRow>
    )
}

