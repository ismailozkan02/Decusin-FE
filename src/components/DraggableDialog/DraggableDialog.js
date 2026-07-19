import {
  Children,
  cloneElement,
  forwardRef,
  Fragment,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import { FormattedMessage } from 'react-intl';
import { v4 } from 'uuid';
import Draggable from 'react-draggable';
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper
} from '@mui/material';
import Close from 'mdi-material-ui/Close';
import { FormProvider } from 'components/hook-form';
import useDialog from 'hooks/useDialog';
import useLocale from 'hooks/useLocale';
import useMounted from 'hooks/useMounted';

const PaperComponent = handle => props => (
  <Draggable
    handle={handle}
    cancel={'[class*="MuiDialogContent-root"]'}
  >
    <Paper {...props} />
  </Draggable>
);

const Component = forwardRef((props, ref) => {
  const {
    id,
    title,
    formProps,
    children,
    onClose,
    noHook,
    noWrapper,
    actions,
    noCancelButton,
    ...rest
  } = props;

  const actionsRef = useRef(null);
  const { formatMessage } = useLocale();
  const { showConfirmation } = useDialog();

  const handleClose = () => {
    if (actionsRef.current.isBusy()) {
      showConfirmation(
        formatMessage('label.warning', 'Warning'),
        formatMessage(`message.an_existing_action_prevents_close`, 'An existing action prevents to close dialog! Do you really want to close?'),
        () => {
          onClose();
        }
      );

      return false;
    }

    onClose();
  };

  const content = (
    <Content
      ref={node => {
        actionsRef.current = node;

        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      children={children}
      noWrapper={noWrapper}
      actions={actions}
      onClose={handleClose}
      noCancelButton={noCancelButton}
    />
  );

  return (
    <Dialog
      fullWidth
      maxWidth={'md'}
      open={true}
      onClose={onClose}
      {
        ...(!rest.fullScreen && {
          PaperComponent: PaperComponent(`#${id}`)
        })
      }
      scroll={'body'}
      aria-labelledby={title}
      transitionDuration={{
        appear: 200,
        enter: 200,
        exit: 0
      }}
      {...rest}
    >
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box id={id} sx={{
          flexGrow: 1,
          cursor: rest.fullScreen ? 'default' : 'move'
        }}>
          <DialogTitle sx={{
            fontWeight: 700
          }}>
            {title}
          </DialogTitle>
        </Box>
        <Box sx={{ p: 4 }}>
          <IconButton
            aria-label={'close'}
            onClick={handleClose}
            sx={{
              color: theme => theme.palette.grey[500]
            }}
          >
            <Close/>
          </IconButton>
        </Box>
      </Box>
      <Divider sx={{ m: 0 }}/>
      {
        formProps ? (
          <FormProvider {...formProps}>
            {content}
          </FormProvider>
        ) : content
      }
    </Dialog>
  );
});

const Content = forwardRef(({ children, noWrapper, actions, onClose, noCancelButton }, ref) => {
  const mounted = useMounted();
  const [busy, setBusy] = useState(false);

  useImperativeHandle(ref, () => ({
    isBusy() {
      return busy;
    },
    busy(status) {
      if (mounted()) {
        setBusy(status);
      }
    }
  }));

  const buttons = Array.isArray(actions) ? Children.map(actions, action => cloneElement(action, {
    loading: busy
  })) : actions;

  return (
    <>
      {
        noWrapper ? children : (
          <DialogContent>
            {children}
          </DialogContent>
        )
      }
      {
        Array.isArray(buttons) && buttons.length > 0 ? (
          <>
            <Divider sx={{ m: 0 }}/>
            <DialogActions sx={{ justifyContent: 'flex-end' }}>
              {
                buttons.map((button, index) => (
                  <Fragment key={index}>
                    {button}
                  </Fragment>
                ))
              }
              {
                !noCancelButton && (
                  <Button color={'secondary'} variant={'outlined'} onClick={onClose}>
                    <FormattedMessage id={'button.cancel'} defaultMessage={'Cancel'}/>
                  </Button>
                )
              }
            </DialogActions>
          </>
        ) : typeof buttons === 'object' && (
          <>
            <Divider sx={{ m: 0 }}/>
            <DialogActions sx={{ justifyContent: 'flex-end' }}>
              {buttons}
            </DialogActions>
          </>
        )
      }
    </>
  );
});

const DraggableDialog = forwardRef((props, ref) => {
  const {
    open,
    onClose,
    loading = false,
    noHook = false
  } = props;

  const { openDialog, closeDialog } = useDialog();
  const idRef = useRef(`dialog-${v4()}`);

  useEffect(() => {
    if (!loading && !noHook) {
      if (open) {
        idRef.current = `dialog-${v4()}`;

        openDialog({
          id: idRef.current,
          component: () => <Component ref={ref} id={idRef.current} {...props}/>
        });
      } else {
        closeDialog(idRef.current);
      }
    }
  }, [open, loading]);

  const handleClose = useCallback((e, reason) => {
    if (reason !== 'backdropClick' && typeof onClose === 'function') {
      onClose(e);
    }
  }, []);

  if (!open) return null;

  return loading ? (
    <Backdrop
      open
      invisible
      sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}
    >
      <CircularProgress color={'primary'}/>
    </Backdrop>
  ) : noHook && <Component ref={ref} id={idRef.current} {...props} onClose={handleClose}/>;
});

export default DraggableDialog;