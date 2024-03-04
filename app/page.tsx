"use client";

import { useRef, useState } from "react";
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
  Select,
  SelectItem,
  MultiSelect,
  MultiSelectItem,
  Button,
  Divider,
  List,
  ListItem,
} from "@tremor/react";
import { RiAddLine, RiDeleteBinLine } from "@remixicon/react";

import askOpenAi from "../lib/openai";
import {
  questionPostfix,
  questionPrefix,
  quotationQuestion,
  technologies,
} from "@/constants";

type taskListProps = { task: string; description: string };
type inputDataProps = {
  task: string;
  description: string;
  technologies: string[] | [];
  developersCount: string;
};

const inputObj = {
  task: "",
  description: "",
  technologies: [],
  developersCount: "1",
};

const numbersList = Array.from({ length: 30 }, (_, i) => i + 1);

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
    let question = questionPrefix;

    question = question.concat(
      inputData.developersCount,
      " developers working using"
    );

    inputData?.technologies?.map((technologyIndex) => {
      const index = Number(technologyIndex);
      question = question.concat(
        `${index === 0 ? " " : " and "}`,
        technologies[index]
      );
    });

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

  const onTechnologySelect = (value: string[]) => {
    setInputData((prevState) => ({
      ...prevState,
      technologies: value,
    }));
  };

  const onDeveloperCountSelect = (value: string) => {
    setInputData((prevState) => ({
      ...prevState,
      developersCount: value,
    }));
  };

  const getResultsCard = () => {
    return (
      <div ref={RESULTS_REF}>
        {result?.length > 0 && (
          <Card className="mx-auto max-w-5xl mt-10">
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
      </div>
    );
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-24">
      <p className="fixed top-0 z-10 text-tremor-metric text-center font-semibold text-gray-700 p-7 bg-slate-200 w-full">
        Project Time Estimate Calculator
      </p>

      <Card className="mx-auto max-w-5xl mt-14">
        <h1 className="mb-10">Project Estimation</h1>

        <p className="whitespace-nowrap text-left font-semibold px-4 py-3.5 text-tremor-content-strong">
          Number of Developers working
        </p>
        <Select
          onValueChange={onDeveloperCountSelect}
          className="mx-4 max-w-xs mb-10"
          value={inputData.developersCount}
        >
          {numbersList.map((value) => (
            <SelectItem key={value} value={value.toString()}>
              {value}
            </SelectItem>
          ))}
        </Select>

        <p className="whitespace-nowrap text-left font-semibold px-4 py-3.5 text-tremor-content-strong">
          Technologies using
        </p>
        <MultiSelect
          onValueChange={onTechnologySelect}
          className="mx-4 max-w-xl mb-10"
        >
          {technologies.map((technology, index) => (
            <MultiSelectItem key={index} value={index.toString()}>
              {technology}
            </MultiSelectItem>
          ))}
        </MultiSelect>

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
            disabled={
              taskList.length === 0 || inputData.technologies.length === 0
            }
            loading={loading}
          >
            Calculate
          </Button>
        </div>
      </Card>

      {getResultsCard()}

      {quotation && (
        <Card className="mx-auto max-w-5xl mt-10" ref={ESTIMATION_REF}>
          <h1 className="mb-5">Project estimation</h1>
          {quotation}
        </Card>
      )}
    </main>
  );
}
