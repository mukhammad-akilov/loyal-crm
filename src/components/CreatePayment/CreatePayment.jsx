import { Cached, CreditScore } from "@mui/icons-material";
import { Container, Typography, Box, Grid, Card, CircularProgress, TextField, Button, Alert, Switch } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ProjectTitle } from "../../config";
import { changePreCheckInfo, getPaymentsFields, paymentPreCheck, makePayment } from "../../store/actions/paymentActions";
import Breadcrumbs from "../Utils/Breadcrumbs";

const useStyles = makeStyles({
  cardContainer: {
    minHeight: 200,
    padding: 30,
  },
});

const CreatePayment = ({ title = "Заголовок пустой", ...props }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  //original
  const { fields, loading, preCheckInfo, preCheckLoading } = useSelector((state) => state.payment);
  const [fieldsState, setFieldsState] = useState({});
  const [validation, setValidation] = useState({});

  //   test
  // const { fields, loading, preCheckInfo, preCheckLoading } = {
  //   fields: [
  //     {
  //       title: "Номер карты",
  //       reg_exp: "^(2200)\\d{6}$",
  //       req_key: "customer_identifier",
  //       required: true,
  //     },
  //     {
  //       title: "Номер карты",
  //       reg_exp: "\\d{9}$",
  //       req_key: "customer_identifier1",
  //       required: true,
  //     },
  //   ],
  //   loading: false,
  //   preCheckInfo: {
  //     customer_identifier: "2200000001",
  //     amount: 18,
  //     customer_info: "Мирзокулов Абдукахор",
  //   },
  //   preCheckLoading: false,
  // };
  // const [fieldsState, setFieldsState] = useState({
  //   customer_identifier: "",
  //   customer_identifier1: "",
  // });
  // const [validation, setValidation] = useState({
  //   customer_identifier: false,
  //   customer_identifier1: false,
  // });

  const [paymentAmount, setPaymentAmount] = useState({
    amount: "",
    anotherAmount: "",
  });
  const { amount, anotherAmount } = paymentAmount;
  const [isAnotherAmount, setIsAnotherAmount] = useState(false);
  const [notValidateField, setNotValidateField] = useState({
    amount: false,
  });

  const resetFields = () => {
    setPaymentAmount({
      amount: "",
      anotherAmount: "",
    });
    dispatch(changePreCheckInfo(null));
    setIsAnotherAmount(false);
    setNotValidateField({
      amount: false,
    });
    let fieldsObj = {};
    let validationFields = {};
    for (let i = 0; i < fields.length; i++) {
      fieldsObj[fields[i].req_key] = "";
      validationFields[fields[i].req_key] = false;
    }
    setFieldsState(fieldsObj);
    setValidation(validationFields);
  };

  const handleChange = (e) => {
    let val = e.target.value.split(".");
    if (isNaN(e.target.value)) {
      return;
    }
    if (val[1]?.length === 3) {
      return;
    }
    setPaymentAmount({ ...paymentAmount, [e.target.name]: e.target.value });
  };

  const handleChangeField = (e, field) => {
    let regex = new RegExp(field.reg_exp);
    setValidation({ ...validation, [e.target.name]: !regex.test(e.target.value) });
    setFieldsState({ ...fieldsState, [e.target.name]: e.target.value });
  };

  const fieldsPaymentHasValueValidation = () => {
    for (let prop in fieldsState) {
      if (fieldsState[prop] === "") {
        return true;
      }
    }
    return false;
  };

  const fieldsPaymentCheckValueValidation = () => {
    for (let prop in validation) {
      if (validation[prop]) {
        return true;
      }
    }
    return false;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    dispatch(makePayment(fieldsState[fields[0].req_key], amount, anotherAmount, resetFields));
  };

  useEffect(() => {
    dispatch(getPaymentsFields());
    document.title = `${title} | ${ProjectTitle}`;
    return () => {
      dispatch(changePreCheckInfo(null));
    };
  }, []);

  useEffect(() => {
    if (fields.length) {
      let fieldsObj = {};
      for (let i = 0; i < fields.length; i++) {
        fieldsObj[fields[i].req_key] = "";
      }
      setFieldsState(fieldsObj);
    }
  }, [fields]);

  console.log(fieldsState);
  console.log(validation);

  return (
    <Container maxWidth={false}>
      <Box my={4} sx={{ textAlign: "center" }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {title}
        </Typography>
      </Box>
      <Breadcrumbs currentLinkText={title} />
      {loading ? (
        <Box textAlign={"center"}>
          <CircularProgress size={50} />
        </Box>
      ) : (
        <Grid container justifyContent={"center"} alignItems={"center"}>
          <Grid item xs={11} md={8} lg={4}>
            {fields.length ? (
              <Card className={classes.cardContainer}>
                <form onSubmit={handleFormSubmit}>
                  <Grid container spacing={2} alignItems={"center"} alignContent={"center"}>
                    {fields.map((field) => {
                      return (
                        <Grid item xs={9} key={field.req_key}>
                          <TextField
                            fullWidth
                            value={fieldsState[field.req_key]}
                            name={`${field.req_key}`}
                            label={field.title}
                            onChange={(e) => handleChangeField(e, field)}
                            error={validation[field.req_key]}
                            onBlur={() =>
                              setValidation({
                                ...validation,
                                [field.req_key]:
                                  fieldsState[field.req_key].trim() == "" ||
                                  !new RegExp(field.reg_exp).test(fieldsState[field.req_key]),
                              })
                            }
                          />
                        </Grid>
                      );
                    })}
                    <Grid item xs={3}>
                      <Button
                        color="secondary"
                        onClick={() => dispatch(paymentPreCheck(fieldsState))}
                        startIcon={!preCheckLoading && <Cached />}
                        variant="contained"
                        disabled={fieldsPaymentHasValueValidation() || fieldsPaymentCheckValueValidation() || preCheckLoading}
                      >
                        {preCheckLoading ? <CircularProgress color="secondary" size={20} /> : `Проверить`}
                      </Button>
                    </Grid>
                  </Grid>
                  {preCheckInfo && (
                    <Box
                      sx={{
                        marginTop: 2,
                        width: "100%",
                        minHeight: 100,
                        backgroundColor: "primary.dark",
                        opacity: [0.7, 0.8, 0.6],
                        borderRadius: "5px",
                      }}
                    >
                      <Box sx={{ padding: "10px", color: "#ffffff" }}>
                        <div>ФИО: {preCheckInfo.customer_info}</div>
                        <div>Баланс: {preCheckInfo.amount}</div>
                      </Box>
                    </Box>
                  )}
                  <Box mt={3}>
                    <TextField
                      fullWidth
                      label="Сумма"
                      name="amount"
                      value={amount}
                      onChange={(e) => handleChange(e)}
                      error={notValidateField.amount && amount === ""}
                      helperText={notValidateField.amount && amount === "" ? "Поле обязательно для заполнения" : ""}
                      onBlur={(event) =>
                        setNotValidateField((prevState) => ({
                          ...prevState,
                          amount: true,
                        }))
                      }
                      onFocus={(event) =>
                        setNotValidateField((prevState) => ({
                          ...prevState,
                          amount: false,
                        }))
                      }
                    />
                  </Box>
                  <Box mt={3}>
                    <Switch color="secondary" checked={isAnotherAmount} onChange={() => setIsAnotherAmount(!isAnotherAmount)} />{" "}
                    Бонусная оплата
                  </Box>
                  {isAnotherAmount && (
                    <Box mt={3}>
                      <TextField
                        fullWidth
                        label="Бонусная оплата"
                        name="anotherAmount"
                        value={anotherAmount}
                        onChange={(e) => handleChange(e)}
                      />
                    </Box>
                  )}
                  <Box mt={3} textAlign={"center"}>
                    <Button
                      disabled={
                        fieldsPaymentCheckValueValidation() ||
                        amount.trim() === "" ||
                        amount <= 0 ||
                        fieldsPaymentHasValueValidation()
                      }
                      startIcon={<CreditScore />}
                      variant="contained"
                      color="secondary"
                      type="submit"
                    >
                      Оплатить
                    </Button>
                  </Box>
                </form>
              </Card>
            ) : (
              <Alert severity="warning">Нет данных!</Alert>
            )}
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default CreatePayment;
