import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import {
  Alert,
  Box,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {
  ArrowForward,
  EmailOutlined,
  LockOutlined,
} from "@mui/icons-material";
import EyeOutline from "mdi-material-ui/EyeOutline";
import EyeOffOutline from "mdi-material-ui/EyeOffOutline";
import useAuth from "hooks/useAuth";
import useMounted from "hooks/useMounted";
import useLocale from "hooks/useLocale";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const mounted = useMounted();
  const { formatMessage } = useLocale();
  const [showPassword, setShowPassword] = useState(false);

  const LoginSchema = Yup.object().shape({
    email: Yup.string()
      .email(formatMessage("login.validation.validEmail", "Enter a valid email"))
      .required(formatMessage("login.validation.emailRequired", "Email is required")),
    password: Yup.string().required(
      formatMessage("login.validation.passwordRequired", "Password is required"),
    ),
  });

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      await login({
        email: data.email,
        password: data.password,
      });

      navigate(searchParams.get("next") || "/overview", { replace: true });
    } catch (e) {
      if (mounted()) {
        setError("afterSubmit", {
          type: "manual",
          message:
            e?.message ||
            formatMessage(
              "login.error.invalidCredentials",
              "Invalid login credentials.",
            ),
        });
      }
    }
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      minHeight: 54,
      borderRadius: 1.4,
      bgcolor: "#F8FAFC",
      transition: "background-color 160ms ease, box-shadow 160ms ease",
      "& fieldset": {
        borderColor: "#E4E7EC",
      },
      "&:hover fieldset": {
        borderColor: "#A6B0BE",
      },
      "&.Mui-focused": {
        bgcolor: "#FFFFFF",
        boxShadow: "0 0 0 4px rgba(47, 179, 68, 0.12)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#2FB344",
      },
    },
    "& .MuiInputBase-input": {
      fontSize: 15,
      fontWeight: 600,
      color: "#101828",
    },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "minmax(420px, 1.08fr) 0.92fr" },
        bgcolor: "#F4F6F1",
      }}
    >
      <Box
        sx={{
          minHeight: { xs: 220, md: "100vh" },
          backgroundImage: "url('/login.png')",
          backgroundPosition: "center",
          backgroundSize: "cover",
          position: "relative",
          overflow: "hidden",
          "&::after": {
            content: '""',
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(10, 12, 10, 0.1) 0%, rgba(10, 12, 10, 0.02) 62%, rgba(244, 246, 241, 0.38) 100%)",
          },
        }}
      />

      <Box
        sx={{
          minHeight: { xs: "calc(100vh - 220px)", md: "100vh" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2.5, sm: 5, lg: 7 },
          py: { xs: 4, md: 6 },
          background:
            "linear-gradient(135deg, #F7F8F4 0%, #FFFFFF 46%, #EEF3EC 100%)",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 440,
            border: "1px solid rgba(16, 24, 40, 0.08)",
            borderRadius: 3,
            bgcolor: "rgba(255, 255, 255, 0.84)",
            boxShadow:
              "0 28px 80px rgba(16, 24, 40, 0.14), 0 8px 24px rgba(47, 179, 68, 0.08)",
            backdropFilter: "blur(18px)",
            p: { xs: 3, sm: 4.5 },
          }}
        >
          <Stack spacing={3}>
            <Stack spacing={1.5} alignItems="center" sx={{ textAlign: "center" }}>
              <Box
                component="img"
                src="/logo.png"
                alt="Decusin"
                sx={{
                  width: { xs: 190, sm: 220 },
                  height: "auto",
                  borderRadius: "4px",
                  objectFit: "contain",
                  display: "block",
                }}
              />

              <Box>
                <Typography sx={{ color: "#667085", fontSize: 15, mt: 0.5 }}>
                  Premium mutfak tasarim paneline guvenli giris.
                </Typography>
              </Box>
            </Stack>

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              {!!errors.afterSubmit && (
                <Alert severity="error" sx={{ mb: 2.4, borderRadius: 1.5 }}>
                  {errors.afterSubmit.message}
                </Alert>
              )}

              <Stack spacing={2.2}>
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 800, mb: 0.9 }}>
                    Email
                  </Typography>
                  <TextField
                    fullWidth
                    autoComplete="email"
                    placeholder="admin@decusin.com"
                    {...register("email")}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlined sx={{ fontSize: 21, color: "#667085" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={inputSx}
                  />
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 800, mb: 0.9 }}>
                    Sifre
                  </Typography>
                  <TextField
                    fullWidth
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Decusin123."
                    {...register("password")}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlined sx={{ fontSize: 21, color: "#667085" }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            edge="end"
                            aria-label="Toggle password visibility"
                            onClick={() => setShowPassword((prev) => !prev)}
                          >
                            {showPassword ? <EyeOutline /> : <EyeOffOutline />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={inputSx}
                  />
                </Box>

                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={2}
                  sx={{ minHeight: 32 }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked
                        size="small"
                        sx={{
                          color: "#98A2B3",
                          "&.Mui-checked": { color: "#2FB344" },
                        }}
                      />
                    }
                    label="Beni hatirla"
                    sx={{
                      m: 0,
                      "& .MuiFormControlLabel-label": {
                        color: "#475467",
                        fontSize: 13,
                        fontWeight: 700,
                      },
                    }}
                  />
                  <Link
                    href="/auth/reset-password"
                    underline="none"
                    sx={{ color: "#2B7A3A", fontSize: 13, fontWeight: 800 }}
                  >
                    Sifremi unuttum
                  </Link>
                </Stack>

                <LoadingButton
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  loading={isSubmitting}
                  endIcon={<ArrowForward />}
                  sx={{
                    height: 52,
                    borderRadius: 1.4,
                    bgcolor: "#101828",
                    textTransform: "none",
                    fontWeight: 900,
                    fontSize: 15,
                    boxShadow: "0 18px 36px rgba(16, 24, 40, 0.22)",
                    "&:hover": {
                      bgcolor: "#1D2939",
                      boxShadow: "0 20px 42px rgba(16, 24, 40, 0.28)",
                    },
                  }}
                >
                  Giris yap
                </LoadingButton>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
