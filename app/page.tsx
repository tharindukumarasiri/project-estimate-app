"use client";

import { useState } from "react";
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
  MultiSelect,
  MultiSelectItem,
  Button,
  Divider,
  List,
  ListItem,
} from "@tremor/react";
import { RiAddLine } from "@remixicon/react";

import askOpenAi from "../lib/openai";
import { questionPostfix, questionPrefix, technologies } from "@/constants";

type taskListProps = { task: string; description: string };
type inputDataProps = {
  task: string;
  description: string;
  technologies: string[] | [];
};

const inputObj = {
  task: "",
  description: "",
  technologies: [],
};

export default function Home() {
  const [taskList, setTaskList] = useState<taskListProps[] | []>([]);
  const [inputData, setInputData] = useState<inputDataProps>(inputObj);
  const [result, setResult] = useState<string[]>([]);
  const [showInputError, setShowInputError] = useState(false);
  const [loading, setLoading] = useState(false);

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
      .catch(() => {
        setResult(["Error while loading please try again"]);
      })
      .finally(() => setLoading(false));
  };

  const onTechnologySelect = (value: string[]) => {
    setInputData((prevState) => ({
      ...prevState,
      technologies: value,
    }));
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-24">
      <p className="text-tremor-metric text-center font-semibold text-tremor-content-strong mb-20">
        Project Time Estimate Calculator
      </p>

      <Card className="mx-auto max-w-5xl">
        <h1 className="mb-10">Project Estimation</h1>

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
      {result?.length > 0 && (
        <Card className="mx-auto max-w-5xl mt-10">
          <h1 className="mb-5">Result</h1>

          <h2>{result[0]}</h2>
          <Divider></Divider>
          <h1 className="mb-5">Breakdown</h1>

          <List>
            {result.map((item, index) => {
              if (index === 0) return;
              const resultParts = item.split(":");
              return (
                <ListItem key={index}>
                  <span>{resultParts[0]}</span>
                  <span>{resultParts[1]}</span>
                </ListItem>
              );
            })}
          </List>
        </Card>
      )}
    </main>
  );
}
