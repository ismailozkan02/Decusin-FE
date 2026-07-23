import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import {
  Alert,
  Box,
  IconButton,
  InputAdornment,
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

const slideImages = [
  "/login.png",
  "/slide/2.jpg",
  "/slide/3.jpg",
  "/slide/4.jpg",
  "/slide/5.jpg",
  "/slide/6.jpg",
];

const carouselRows = [
  [...slideImages, ...slideImages],
  [...slideImages.slice(2), ...slideImages.slice(0, 2), ...slideImages],
];

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const mounted = useMounted();
  const { formatMessage } = useLocale();
  const [showPassword, setShowPassword] = useState(false);
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });

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

  const handleSurfaceMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setSpotlight({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
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
        "@keyframes galleryFlow": {
          "0%": { transform: "translate3d(0, 0, 0)" },
          "100%": { transform: "translate3d(-50%, 0, 0)" },
        },
        "@keyframes galleryFlowReverse": {
          "0%": { transform: "translate3d(-50%, 0, 0)" },
          "100%": { transform: "translate3d(0, 0, 0)" },
        },
        "@keyframes galleryFloat": {
          "0%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
          "100%": { transform: "translateY(0)" },
        },
        "@keyframes panelEnter": {
          "0%": {
            opacity: 0,
            transform: "translate3d(26px, 18px, 0) scale(0.985)",
          },
          "100%": {
            opacity: 1,
            transform: "translate3d(0, 0, 0) scale(1)",
          },
        },
        "@keyframes borderGlow": {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
        "@keyframes surfaceFlow": {
          "0%": { backgroundPosition: "center, 0% 0%, 0 0, 0 0" },
          "100%": { backgroundPosition: "center, 140% 0%, 36px 36px, -36px 28px" },
        },
      }}
    >
      <Box
        sx={{
          minHeight: { xs: 220, md: "100vh" },
          position: "relative",
          overflow: "hidden",
          isolation: "isolate",
          display: "flex",
          alignItems: "center",
          bgcolor: "#15140F",
          background:
            "linear-gradient(135deg, #15140F 0%, #252018 45%, #0E1511 100%)",
          px: { xs: 2, md: 4.5 },
          "&::after": {
            content: '""',
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(21,20,15,0.88) 0%, transparent 13%, transparent 78%, rgba(21,20,15,0.9) 100%), linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 18%, transparent 82%, rgba(0,0,0,0.32) 100%)",
            zIndex: 3,
            pointerEvents: "none",
          },
          "&:hover .gallery-track": {
            animationPlayState: "paused",
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -120,
            left: "8%",
            right: "8%",
            height: 260,
            background:
              "radial-gradient(ellipse at center, rgba(218, 178, 95, 0.46) 0%, rgba(218, 178, 95, 0.18) 38%, transparent 72%)",
            filter: "blur(34px)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -150,
            left: "-4%",
            right: "-4%",
            height: 310,
            background:
              "radial-gradient(ellipse at center, rgba(199, 151, 68, 0.42) 0%, rgba(199, 151, 68, 0.16) 42%, transparent 74%)",
            filter: "blur(42px)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />

        <Stack
          spacing={{ xs: 1.8, md: 3 }}
          sx={{
            width: "100%",
            transform: { xs: "rotate(-2deg) scale(1.06)", md: "rotate(-2.5deg) scale(1.04)" },
            transformOrigin: "center",
          }}
        >
          {carouselRows.map((row, rowIndex) => (
            <Box
              key={rowIndex}
              className="gallery-track"
              sx={{
                display: "flex",
                width: "max-content",
                gap: { xs: 1.8, md: 3 },
                animation:
                  rowIndex === 0
                    ? "galleryFlow 42s linear infinite"
                    : "galleryFlowReverse 48s linear infinite",
                willChange: "transform",
              }}
            >
              {row.map((src, index) => (
                <Box
                  key={`${rowIndex}-${src}-${index}`}
                  className="gallery-card"
                  sx={{
                    width: { xs: 188, sm: 260, md: 360, lg: 430 },
                    aspectRatio: "1.32 / 1",
                    borderRadius: { xs: 2, md: 2.5 },
                    overflow: "hidden",
                    flex: "0 0 auto",
                    bgcolor: "#0F1110",
                    boxShadow:
                      "0 26px 80px rgba(0,0,0,0.34), 0 0 0 1px rgba(255,255,255,0.12)",
                    transition:
                      "transform 260ms ease, box-shadow 260ms ease, filter 260ms ease",
                    position: "relative",
                    zIndex: 1,
                    "&:hover": {
                      transform: "translateY(-12px) scale(1.055)",
                      zIndex: 8,
                      filter: "brightness(1.04) saturate(1.02)",
                      boxShadow:
                        "0 34px 95px rgba(0,0,0,0.44), 0 0 0 1px rgba(218,178,95,0.5), 0 0 46px rgba(218,178,95,0.2)",
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={src}
                    alt=""
                    draggable={false}
                    sx={{
                      width: "100%",
                      height: "100%",
                      display: "block",
                      objectFit: "cover",
                      objectPosition: "center",
                      imageRendering: "auto",
                    }}
                  />
                </Box>
              ))}
            </Box>
          ))}
        </Stack>

        <Box
          sx={{
            position: "absolute",
            left: { xs: 18, md: 34 },
            bottom: { xs: 18, md: 32 },
            zIndex: 4,
            color: "#FFFFFF",
            px: 2,
            py: 1.2,
            borderRadius: 2,
            bgcolor: "rgba(15, 17, 16, 0.52)",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow: "0 20px 45px rgba(0,0,0,0.24)",
          }}
        >
          <Typography sx={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.2 }}>
            DECUSIN SHOWROOM
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.72)", fontSize: 12, mt: 0.3 }}>
            Premium mutfak koleksiyonlari
          </Typography>
        </Box>
      </Box>

      <Box
        onMouseMove={handleSurfaceMouseMove}
        onMouseLeave={() => setSpotlight({ x: 50, y: 50 })}
        sx={{
          minHeight: { xs: "calc(100vh - 220px)", md: "100vh" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2.5, sm: 5, lg: 7 },
          py: { xs: 4, md: 6 },
          position: "relative",
          overflow: "hidden",
          background:
            `radial-gradient(circle at ${spotlight.x}% ${spotlight.y}%, rgba(218,178,95,0.34) 0%, rgba(47,179,68,0.12) 22%, transparent 42%), linear-gradient(115deg, rgba(255,255,255,0) 0%, rgba(199,166,106,0.14) 34%, rgba(47,179,68,0.09) 50%, rgba(255,255,255,0) 66%), linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(246,248,242,0.98) 48%, rgba(232,239,229,0.98) 100%), linear-gradient(90deg, rgba(16,24,40,0.04) 1px, transparent 1px)`,
          backgroundSize: "100% 100%, 220% 100%, 100% 100%, 36px 36px",
          animation: "surfaceFlow 18s linear infinite",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: 1,
            bgcolor: "rgba(16, 24, 40, 0.1)",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            inset: "8% 9%",
            border: "1px solid rgba(199, 166, 106, 0.12)",
            borderRadius: 4,
            transform: "rotate(-1.2deg)",
            pointerEvents: "none",
          },
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 440,
            position: "relative",
            overflow: "hidden",
            border: "1px solid rgba(16, 24, 40, 0.07)",
            borderRadius: 3,
            bgcolor: "rgba(255, 255, 255, 0.78)",
            boxShadow:
              "0 32px 90px rgba(16, 24, 40, 0.16), 0 12px 28px rgba(47, 179, 68, 0.1)",
            backdropFilter: "blur(22px)",
            p: { xs: 3, sm: 4.5 },
            animation: "panelEnter 680ms cubic-bezier(0.2, 0.8, 0.2, 1) both",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background:
                "linear-gradient(90deg, #101828, #C7A66A, #2FB344, #101828)",
              backgroundSize: "200% 100%",
              animation: "borderGlow 5.5s linear infinite",
            },
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
                    placeholder="Email adresinizi girin"
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
                    placeholder="Sifrenizi girin"
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
                    mt: 0.6,
                    boxShadow: "0 18px 36px rgba(16, 24, 40, 0.24)",
                    transition:
                      "transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease",
                    "&:hover": {
                      bgcolor: "#1D2939",
                      transform: "translateY(-1px)",
                      boxShadow: "0 20px 42px rgba(16, 24, 40, 0.28)",
                    },
                    "&:active": {
                      transform: "translateY(0)",
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
