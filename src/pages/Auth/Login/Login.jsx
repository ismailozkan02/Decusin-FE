import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import {
  Alert,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Paper,
  Button,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {
  EmailOutlined,
  LockOutlined,
  ArrowForward,
  SchoolOutlined,
  FamilyRestroomOutlined,
  ShieldOutlined,
  HomeOutlined,
  BusinessCenterOutlined,
  LanguageOutlined,
  ApartmentOutlined,
  AccountTreeOutlined,
  HandshakeOutlined,
} from "@mui/icons-material";
import EyeOutline from "mdi-material-ui/EyeOutline";
import EyeOffOutline from "mdi-material-ui/EyeOffOutline";
import useAuth from "hooks/useAuth";
import useMounted from "hooks/useMounted";
import useLocale from "hooks/useLocale";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const mounted = useMounted();
  const { formatMessage } = useLocale();

  const [loginType, setLoginType] = useState("individual");
  const [selectedRole, setSelectedRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);

  const isPartner = loginType === "partner";

  const roles = [
    {
      key: "student",
      label: formatMessage("login.role.student", "Student"),
      icon: <SchoolOutlined />,
    },
    {
      key: "parent",
      label: formatMessage("login.role.parent", "Parent/Supporter"),
      icon: <FamilyRestroomOutlined />,
    },
    {
      key: "consultant",
      label: formatMessage("login.role.consultant", "Consultant"),
      icon: <ShieldOutlined />,
    },
    {
      key: "host",
      label: formatMessage("login.role.host", "Host"),
      icon: <HomeOutlined />,
    },
  ];

  const LoginSchema = Yup.object().shape({
    organization_code: isPartner
      ? Yup.string().required(
          formatMessage(
            "login.validation.organizationCodeRequired",
            "Organization code is required",
          ),
        )
      : Yup.string(),
    email: Yup.string()
      .email(
        formatMessage("login.validation.validEmail", "Enter a valid email"),
      )
      .required(
        formatMessage("login.validation.emailRequired", "Email is required"),
      ),
    password: Yup.string().required(
      formatMessage(
        "login.validation.passwordRequired",
        "Password is required",
      ),
    ),
  });

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues: {
      organization_code: "ORG-XXXXX",
      email: "student@email.com",
      password: "demo123",
    },
  });

  const changeLoginType = (type) => {
    setLoginType(type);
    setShowPassword(false);

    reset({
      organization_code: type === "partner" ? "ORG-XXXXX" : "",
      email:
        type === "partner" ? "contact@organization.com" : "student@email.com",
      password: "demo123",
    });
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      height: 40,
      borderRadius: 1.4,
      bgcolor: "#F8FAFC",
    },
    "& .MuiInputBase-input": {
      fontSize: 14,
    },
  };

  const onSubmit = async (data) => {
    try {
      await login({
        email: data.email,
        password: data.password,
        device_os: "web",
        ...(isPartner
          ? {
              account_type: "partner",
              organization_code: data.organization_code,
            }
          : {
              account_type: selectedRole,
            }),
      });

      navigate("/overview", { replace: true });
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

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        bgcolor: "#F5F6FA",
      }}
    >
      <Box
        sx={{
          bgcolor: "#111827",
          color: "#FFFFFF",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2.5, sm: 4 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        {!isPartner ? (
          <Box>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ mb: 5 }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: "#2563EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 20,
                }}
              >
                E
              </Box>

              <Typography
                sx={{ fontSize: 28, fontWeight: 600, color: "#FFFFFF" }}
              >
                EuroLink
              </Typography>
            </Stack>

            <Typography
              sx={{
                fontSize: { md: 34, lg: 38 },
                lineHeight: 1.25,
                fontWeight: 600,
                mb: 3,
                maxWidth: 520,
                color: "#FFFFFF",
              }}
            >
              {formatMessage(
                "login.left.individualTitle",
                "Your Education Journey in Germany Starts Here",
              )}
            </Typography>

            <Typography
              sx={{
                color: "#8A94A6",
                fontSize: 18,
                lineHeight: 1.7,
                maxWidth: 520,
                mb: 6,
              }}
            >
              {formatMessage(
                "login.left.individualDescription",
                "Manage your entire process from visa procedures and university matching to accommodation and language courses from a single platform.",
              )}
            </Typography>

            <Stack direction="row" spacing={2}>
              {[
                [
                  "248",
                  formatMessage(
                    "login.stats.activeStudents",
                    "Active Students",
                  ),
                ],
                ["%84", formatMessage("login.stats.placement", "Placement")],
                [
                  "92",
                  formatMessage("login.stats.universities", "Universities"),
                ],
              ].map(([value, label]) => (
                <Paper
                  key={label}
                  elevation={0}
                  sx={{
                    width: 140,
                    height: 86,
                    borderRadius: 2,
                    bgcolor: "#1F2937",
                    color: "white",
                    p: 2,
                  }}
                >
                  <Typography
                    sx={{ fontSize: 26, fontWeight: 800, color: "#FFFFFF" }}
                  >
                    {value}
                  </Typography>
                  <Typography sx={{ color: "#8A94A6", fontSize: 12 }}>
                    {label}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </Box>
        ) : (
          <Box>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ mb: 5 }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: "#2563EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BusinessCenterOutlined sx={{ fontSize: 27 }} />
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: 26,
                    fontWeight: 800,
                    lineHeight: 1,
                    color: "#FFFFFF",
                  }}
                >
                  EuroLink
                </Typography>
                <Typography
                  sx={{
                    color: "#8A94A6",
                    fontSize: 12,
                    letterSpacing: 1.4,
                    mt: 0.7,
                  }}
                >
                  {formatMessage("login.partnerPortal", "PARTNER PORTAL")}
                </Typography>
              </Box>
            </Stack>

            <Typography
              sx={{
                fontSize: { md: 34, lg: 38 },
                lineHeight: 1.2,
                fontWeight: 400,
                mb: 3,
                color: "#FFFFFF",
              }}
            >
              {formatMessage(
                "login.left.partnerTitle",
                "Corporate Partner Login",
              )}
            </Typography>

            <Typography
              sx={{
                color: "#8A94A6",
                fontSize: 18,
                lineHeight: 1.75,
                maxWidth: 520,
                mb: 6,
              }}
            >
              {formatMessage(
                "login.left.partnerDescription",
                "Access the management panel specially designed for schools, universities, language courses, and corporate partners.",
              )}
            </Typography>

            <Stack spacing={2}>
              {[
                {
                  icon: <ApartmentOutlined />,
                  title: formatMessage(
                    "login.partnerFeature.multiInstitutionTitle",
                    "Multi-Institution Management",
                  ),
                  desc: formatMessage(
                    "login.partnerFeature.multiInstitutionDesc",
                    "Manage multiple branches and campuses from a single panel",
                  ),
                },
                {
                  icon: <HandshakeOutlined />,
                  title: formatMessage(
                    "login.partnerFeature.studentReferralTitle",
                    "Student Referrals",
                  ),
                  desc: formatMessage(
                    "login.partnerFeature.studentReferralDesc",
                    "Share your prospective students with EuroLink",
                  ),
                },
                {
                  icon: <ShieldOutlined />,
                  title: formatMessage(
                    "login.partnerFeature.secureDataTitle",
                    "Secure Data Sharing",
                  ),
                  desc: formatMessage(
                    "login.partnerFeature.secureDataDesc",
                    "KVKK and GDPR compliant infrastructure",
                  ),
                },
              ].map((item) => (
                <Paper
                  key={item.title}
                  elevation={0}
                  sx={{
                    width: "100%",
                    maxWidth: 470,
                    borderRadius: 2.5,
                    bgcolor: "#1F2937",
                    px: 2.2,
                    py: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.8,
                  }}
                >
                  <Box sx={{ color: "#2563EB", display: "flex" }}>
                    {item.icon}
                  </Box>

                  <Box>
                    <Typography sx={{ color: "white", fontWeight: 400 }}>
                      {item.title}
                    </Typography>
                    <Typography
                      sx={{ color: "#8A94A6", fontSize: 12, mt: 0.4 }}
                    >
                      {item.desc}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Box>
        )}
      </Box>

      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2.5, sm: 4 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 385 }}>
          {isPartner ? (
            <>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.8,
                  bgcolor: "#EAF0FF",
                  color: "#2563EB",
                  px: 1.3,
                  py: 0.55,
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                <LanguageOutlined sx={{ fontSize: 15 }} />
                {formatMessage("login.corporateAccess", "Corporate Access")}
              </Box>

              <Typography
                sx={{
                  fontSize: 28,
                  fontWeight: 600,
                  color: "#0F172A",
                  mb: 0.7,
                }}
              >
                {formatMessage(
                  "login.partnerAccountTitle",
                  "Partner Account Login",
                )}
              </Typography>

              <Typography sx={{ color: "#64748B", mb: 3.5 }}>
                {formatMessage(
                  "login.partnerAccountSubtitle",
                  "Sign in with your corporate account",
                )}
              </Typography>
            </>
          ) : (
            <>
              <Typography
                sx={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: "#0F172A",
                  mb: 0.5,
                }}
              >
                {formatMessage("login.welcome", "Welcome")}
              </Typography>

              <Typography sx={{ color: "#64748B", mb: 3 }}>
                {formatMessage("login.subtitle", "Sign in to your account")}
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 1,
                  bgcolor: "#EEF1F6",
                  p: 0.7,
                  borderRadius: 2,
                  mb: 3,
                }}
              >
                {roles.map((role) => {
                  const active = selectedRole === role.key;

                  return (
                    <Button
                      key={role.key}
                      onClick={() => setSelectedRole(role.key)}
                      startIcon={role.icon}
                      sx={{
                        height: 36,
                        borderRadius: 1.5,
                        textTransform: "none",
                        fontSize: 13,
                        color: active ? "#111827" : "#64748B",
                        bgcolor: active ? "white" : "transparent",
                        fontWeight: active ? 700 : 500,
                        boxShadow: active
                          ? "0 1px 4px rgba(15,23,42,0.12)"
                          : "none",
                        "&:hover": {
                          bgcolor: active ? "white" : "rgba(255,255,255,0.45)",
                        },
                      }}
                    >
                      {role.label}
                    </Button>
                  );
                })}
              </Box>
            </>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {!!errors.afterSubmit && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.afterSubmit.message}
              </Alert>
            )}

            <Stack spacing={2.4}>
              {isPartner && (
                <Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 800, mb: 1 }}>
                    {formatMessage(
                      "login.organizationCode",
                      "Organization Code",
                    )}
                  </Typography>

                  <TextField
                    fullWidth
                    placeholder={formatMessage(
                      "login.organizationCodePlaceholder",
                      "ORG-XXXXX",
                    )}
                    {...register("organization_code")}
                    error={!!errors.organization_code}
                    helperText={errors.organization_code?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountTreeOutlined
                            sx={{ fontSize: 20, color: "#64748B" }}
                          />
                        </InputAdornment>
                      ),
                    }}
                    sx={inputSx}
                  />
                </Box>
              )}

              <Box>
                <Typography sx={{ fontSize: 14, fontWeight: 800, mb: 1 }}>
                  {isPartner
                    ? formatMessage("login.corporateEmail", "Corporate Email")
                    : formatMessage("login.email", "Email")}
                </Typography>

                <TextField
                  fullWidth
                  placeholder={
                    isPartner
                      ? formatMessage(
                          "login.corporateEmailPlaceholder",
                          "contact@organization.com",
                        )
                      : formatMessage(
                          "login.emailPlaceholder",
                          "student@email.com",
                        )
                  }
                  {...register("email")}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlined
                          sx={{ fontSize: 20, color: "#64748B" }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={inputSx}
                />
              </Box>

              <Box>
                <Typography sx={{ fontSize: 14, fontWeight: 800, mb: 1 }}>
                  {formatMessage("login.password", "Password")}
                </Typography>

                <TextField
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined sx={{ fontSize: 20, color: "#64748B" }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
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
                  height: 40,
                  borderRadius: 1.2,
                  bgcolor: "#2563EB",
                  textTransform: "none",
                  fontWeight: 600,
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: "#1D4ED8",
                    boxShadow: "none",
                  },
                }}
              >
                {isPartner
                  ? formatMessage("login.partnerLoginButton", "Partner Login")
                  : formatMessage("login.loginButton", "Log In")}
              </LoadingButton>
            </Stack>
          </Box>

          <Box sx={{ textAlign: "center", mt: 2.7 }}>
            <Typography
              component={RouterLink}
              to="/auth/reset-password"
              sx={{ color: "#2563EB", textDecoration: "none", fontSize: 14 }}
            >
              {isPartner
                ? formatMessage(
                    "login.forgotPartnerPassword",
                    "Forgot your institution password?",
                  )
                : formatMessage("login.forgotPassword", "Forgot Password?")}
            </Typography>
          </Box>

          <Box sx={{ textAlign: "center", mt: 2.7 }}>
            <Typography sx={{ color: "#64748B", fontSize: 14 }}>
              {isPartner
                ? formatMessage(
                    "login.notPartnerQuestion",
                    "Not a partner yet? ",
                  )
                : formatMessage(
                    "login.noAccountQuestion",
                    "Don’t have an account? ",
                  )}
              <Typography
                component={RouterLink}
                to="/auth/register"
                sx={{
                  color: "#2563EB",
                  fontWeight: 400,
                  textDecoration: "none",
                }}
              >
                {isPartner
                  ? formatMessage("login.applyNow", "Apply Now")
                  : formatMessage("login.signUp", "Sign Up")}
              </Typography>
            </Typography>
          </Box>

          <Typography
            sx={{ textAlign: "center", color: "#64748B", fontSize: 12, mt: 4 }}
          >
            {formatMessage(
              "login.securityText",
              "KVKK Compliant · Encrypted Data Transfer · Secure Platform",
            )}
          </Typography>
        </Box>

        <Paper
          onClick={() => changeLoginType(isPartner ? "individual" : "partner")}
          elevation={4}
          sx={{
            position: "absolute",
            right: 24,
            bottom: 16,
            borderRadius: 2,
            px: 2,
            py: 1.2,
            display: { xs: "none", sm: "flex" },
            alignItems: "center",
            gap: 1.2,
            cursor: "pointer",
            minWidth: 170,
          }}
        >
          {isPartner ? (
            <HomeOutlined sx={{ color: "#2563EB", fontSize: 22 }} />
          ) : (
            <BusinessCenterOutlined sx={{ color: "#2563EB", fontSize: 22 }} />
          )}

          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 800 }}>
              {isPartner
                ? formatMessage("login.individualAccount", "Individual Account")
                : formatMessage("login.partnerAccount", "Partner Account")}
            </Typography>
            <Typography sx={{ fontSize: 10, color: "#64748B" }}>
              {isPartner
                ? formatMessage(
                    "login.individualLoginHint",
                    "Individual user login",
                  )
                : formatMessage(
                    "login.partnerLoginHint",
                    "Corporate partner login",
                  )}
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login;
