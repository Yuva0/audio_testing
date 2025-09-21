import React, { useEffect, useState } from 'react';
import UserEntryTable from '../../../components/UserEntryTable';

const ProductionUserPage = ({ params }) => {
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const name = decodeURIComponent(params.id);

  useEffect(() => {
    const fetchEntry = async () => {
      const res = await fetch(`/api/production?name=${encodeURIComponent(name)}`);
      const data = await res.json();
      if (data.success && data.entry) setEntry(data.entry);
      setLoading(false);
    };
    fetchEntry();
  }, [name]);

  if (loading) return <div style={{ color: '#232326', textAlign: 'center', marginTop: 40 }}>Loading...</div>;
  if (!entry) return <div style={{ color: '#232326', textAlign: 'center', marginTop: 40 }}>No entry found for {name}</div>;

  return <UserEntryTable entry={entry} title="Production Entry" />;
};

export default ProductionUserPage;

export async function getServerSideProps(context) {
  return { props: { params: context.params } };
}
