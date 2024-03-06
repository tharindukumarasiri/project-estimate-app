"use client";

import { ChangeEvent, useRef, useState } from "react";
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TextInput,
  Textarea,
  Button,
  Divider,
  List,
  ListItem,
  NumberInput,
  SelectItem,
  Select,
} from "@tremor/react";
import { RiAddLine, RiDeleteBinLine } from "@remixicon/react";

import askOpenAi from "../../lib/openai";
import {
  constructionPrefix,
  constructionTypes,
  questionPostfix,
  questionPrefix,
  quotationQuestion,
} from "@/constants";

type taskListProps = { task: string; description: string };
type inputDataProps = {
  task: string;
  description: string;
  constrictionType: string;
  developersCount: {
    beginner: string;
    intermediate: string;
    experienced: string;
  };
  area: string;
};

const inputObj = {
  area: "",
  task: "",
  description: "",
  constrictionType: "",
  developersCount: { beginner: "0", intermediate: "0", experienced: "0" },
};

export default function Home() {
  const [taskList, setTaskList] = useState<taskListProps[] | []>([]);
  const [inputData, setInputData] = useState<inputDataProps>(inputObj);
  const [result, setResult] = useState<string[]>([]);
  const [quotation, setQuotation] = useState("");
  const [showInputError, setShowInputError] = useState(false);
  const [loading, setLoading] = useState(false);

  const RESULTS_REF = useRef<HTMLDivElement>(null);
  const ESTIMATION_REF = useRef<HTMLDivElement>(null);

  const addNewTask = () => {
    if (!inputData?.task) {
      setShowInputError(true);
      return;
    }

    const newTaskList = [...taskList];
    newTaskList.push({
      task: inputData.task,
      description: inputData.description,
    });

    setTaskList(newTaskList);
    setInputData((prevState) => ({
      ...prevState,
      task: "",
      description: "",
    }));
  };

  const deleteTask = (taskId: number) => {
    const newTaskList = [...taskList];
    newTaskList.splice(taskId, 1);

    setTaskList(newTaskList);
  };

  const handleInput = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const fieldName = e.target?.name;
    const fieldValue = e.target?.value;

    setShowInputError(false);
    setInputData((prevState) => ({
      ...prevState,
      [fieldName]: fieldValue,
    }));
  };

  const onCalculate = async () => {
    setLoading(true);
    let question = constructionPrefix;

    question = question.concat(
      inputData.constrictionType,
      " project of ",
      inputData.area,
      " square feet of area if "
    );

    if (Number(inputData?.developersCount?.beginner) > 0)
      question = question.concat(
        inputData.developersCount.beginner,
        " beginner workers working"
      );

    if (Number(inputData?.developersCount?.intermediate) > 0)
      question = question.concat(
        inputData.developersCount.intermediate,
        " intermediate workers working"
      );

    if (Number(inputData?.developersCount?.experienced) > 0)
      question = question.concat(
        inputData.developersCount.experienced,
        " experienced workers working"
      );

    taskList.map(({ task, description }) => {
      question = question.concat(", ", task, ": ", description);
    });

    question = question.concat(" ", questionPostfix);

    askOpenAi(question)
      .then((response) => {
        const resultList = (response.choices[0].message.content || "").split(
          "\n"
        );

        setResult(resultList);
      })
      .catch((error) => {
        setResult(["Error while loading please try again"]);
      })
      .finally(() => {
        RESULTS_REF?.current?.scrollIntoView({ behavior: "smooth" });
        setLoading(false);
      });
  };

  const onGetQuotation = async () => {
    setLoading(true);

    askOpenAi(quotationQuestion)
      .then((response) => {
        const result = response.choices[0].message.content || "";

        setQuotation(result);
      })
      .catch(() => {
        setQuotation("Error while loading please try again");
      })
      .finally(() => {
        ESTIMATION_REF?.current?.scrollIntoView({ behavior: "smooth" });
        setLoading(false);
      });
  };

  const onTechnologySelect = (value: string) => {
    setInputData((prevState) => ({
      ...prevState,
      constrictionType: value,
    }));
  };

  const onchangeArea = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fieldValue = e.target?.value;
    setInputData((prevState) => ({
      ...prevState,
      area: fieldValue,
    }));
  };

  const onDeveloperCountSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const fieldName = e.target?.name;
    const fieldValue = e.target?.value;

    setInputData((prevState) => ({
      ...prevState,
      developersCount: {
        ...prevState.developersCount,
        [fieldName]: fieldValue,
      },
    }));
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-start p-24">
      <Card className="mx-auto max-w-5xl mt-14">
        <h1 className="mb-10">Project Estimation</h1>

        <p className="whitespace-nowrap text-left font-semibold px-4 py-3.5 text-tremor-content-strong">
          Constriction type
        </p>
        <Select
          onValueChange={onTechnologySelect}
          className="mx-4 max-w-xl mb-10"
        >
          {constructionTypes.map((technology, index) => (
            <SelectItem key={index} value={technology}>
              {technology}
            </SelectItem>
          ))}
        </Select>

        <p className="whitespace-nowrap text-left font-semibold px-4 py-3.5 text-tremor-content-strong">
          Area of construction(ft²)
        </p>
        <div className="mx-4 flex flex-row mb-10">
          <NumberInput
            className="max-w-[20px]"
            value={inputData.area}
            placeholder="ft²"
            name="area"
            min={0}
            onChange={onchangeArea}
          />
        </div>

        <p className="whitespace-nowrap text-left font-semibold px-4 py-3.5 text-tremor-content-strong">
          Number of workers
        </p>
        <div className="mx-4 flex flex-row mb-10">
          <div className="mr-5">
            <div className="mb-3">Beginner</div>
            <NumberInput
              name="beginner"
              className="max-w-[20px]"
              value={inputData.developersCount.beginner}
              min={0}
              max={20}
              onChange={onDeveloperCountSelect}
            />
          </div>
          <div className="mr-5">
            <div className="mb-3">Intermediate</div>
            <NumberInput
              name="intermediate"
              className="max-w-[20px]"
              value={inputData.developersCount.intermediate}
              min={0}
              max={20}
              onChange={onDeveloperCountSelect}
            />
          </div>
          <div className="mr-5">
            <div className="mb-3">Experienced</div>
            <NumberInput
              name="experienced"
              className="max-w-[20px]"
              value={inputData.developersCount.experienced}
              min={0}
              max={20}
              onChange={onDeveloperCountSelect}
            />
          </div>
        </div>

        <div className="max-w-4xl">
          <Table className="pb-10">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Task Name</TableHeaderCell>
                <TableHeaderCell>Description</TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {taskList?.map((task, index) => (
                <TableRow key={index}>
                  <TableCell className="text-wrap">{task.task}</TableCell>
                  <TableCell className="text-wrap">
                    {task.description}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="light"
                      icon={RiDeleteBinLine}
                      onClick={() => deleteTask(index)}
                      className="text-red-500 hover:text-red-700"
                    />
                  </TableCell>
                </TableRow>
              ))}

              <TableRow>
                <TableCell>
                  <TextInput
                    type="text"
                    id="task"
                    name="task"
                    value={inputData.task}
                    onChange={handleInput}
                    error={showInputError}
                    errorMessage="Please enter a task"
                  />
                </TableCell>
                <TableCell>
                  <Textarea
                    id="description"
                    name="description"
                    value={inputData.description}
                    onChange={handleInput}
                  />
                </TableCell>
                <TableCell>
                  <div className="space-y-3">
                    <div className="flex justify-center">
                      <Button
                        type="submit"
                        title="Submit"
                        variant="light"
                        icon={RiAddLine}
                        iconPosition="left"
                        onClick={addNewTask}
                      >
                        Add New Task
                      </Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-center">
          <Button
            variant="primary"
            onClick={onCalculate}
            disabled={taskList.length === 0 || !inputData.constrictionType}
            loading={loading}
          >
            Calculate
          </Button>
        </div>
      </Card>

      {result?.length > 0 && (
        <Card className="mx-auto max-w-5xl mt-10" ref={RESULTS_REF}>
          <h1 className="mb-5">Result</h1>

          <h2>{result[0]}</h2>
          <Divider></Divider>
          <h1 className="mb-5">Breakdown</h1>

          <List>
            {result.map((item, index) => {
              if (index === 0) return;
              let resultParts = item.split(":");
              if (resultParts?.length === 1) resultParts = item.split(" - ");
              return (
                <ListItem key={index}>
                  <span>{resultParts[0]}</span>
                  <span>{resultParts[1]}</span>
                </ListItem>
              );
            })}
          </List>
          <div className="flex justify-center mt-5">
            <Button
              variant="secondary"
              onClick={onGetQuotation}
              loading={loading}
            >
              Get quotation
            </Button>
          </div>
        </Card>
      )}

      {quotation && (
        <Card className="mx-auto max-w-5xl mt-10" ref={ESTIMATION_REF}>
          <h1 className="mb-5">Project estimation</h1>
          {quotation}
        </Card>
      )}
    </div>
  );
}
