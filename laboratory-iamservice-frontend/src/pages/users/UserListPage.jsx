import { useEffect, useMemo, useState } from "react";
import { Table, Input, Button, Space, Card, Empty } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "@/redux/features/iamUserSlice";
import { useNavigate } from "react-router-dom";

export default function UserListPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { list, total, loading } = useSelector((s) => s.iamUsers);

    // local state cho filter/sort/pagination
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [keyword, setKeyword] = useState("");
    const [sorter, setSorter] = useState({ field: "id", order: "ascend" });

    useEffect(() => {
        dispatch(fetchUsers({
            page: page - 1,               // backend Spring Data: 0-based
            size,
            keyword: keyword || undefined,
            sort: sorter?.field ? `${sorter.field},${sorter.order === "ascend" ? "asc" : "desc"}` : undefined,
        }));
    }, [page, size, keyword, sorter, dispatch]);

    const columns = useMemo(() => ([
        { title: "ID", dataIndex: "id", sorter: true },
        { title: "Name", dataIndex: "name", sorter: true },
        { title: "Email", dataIndex: "email", sorter: true },
        // có thể thêm Status, Role...
    ]), []);

    const onTableChange = (_pagi, _filters, sort) => {
        if (sort?.order) {
            setSorter({ field: sort.field, order: sort.order });
        } else {
            setSorter({ field: "id", order: "ascend" });
        }
    };

    return (
        <Card
            title="IAM — Users"
            extra={<Button type="primary" onClick={() => navigate("/users/create")}>Create User</Button>}
            style={{ maxWidth: 1000, margin: "24px auto" }}
        >
            <Space style={{ marginBottom: 12, width: "100%" }}>
                <Input.Search
                    placeholder="Search by name or email"
                    allowClear
                    onSearch={setKeyword}
                    style={{ maxWidth: 320 }}
                />
            </Space>

            {(!loading && (!list || list.length === 0)) ? (
                <Empty description="No data to display" />
            ) : (
                <Table
                    rowKey="id"
                    loading={loading}
                    columns={columns}
                    dataSource={list}
                    pagination={{
                        current: page,
                        pageSize: size,
                        total,
                        showSizeChanger: true,
                        onChange: (p, s) => { setPage(p); setSize(s); },
                    }}
                    onChange={onTableChange}
                />
            )}
        </Card>
    );
}
