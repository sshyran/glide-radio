import { Queue } from "./stats";

it("empty queue", () => {
    const queue = new Queue<number>(0);
    const emptyDequeue = queue.dequeue();
    expect(emptyDequeue).toEqual(undefined);
});

it("non-empty queue", () => {
    const queue = new Queue<number>(2);
    queue.enqueue(1);
    const d1 = queue.dequeue();
    expect(d1).toEqual(1);
    const d2 = queue.dequeue();
    expect(d2).toEqual(undefined);
});

it("non-empty queue 2", () => {
    const queue = new Queue<number>(2);
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);
    const d1 = queue.dequeue();
    expect(d1).toEqual(2);
    const d2 = queue.dequeue();
    expect(d2).toEqual(3);
    const d3 = queue.dequeue();
    expect(d3).toEqual(undefined);
});
